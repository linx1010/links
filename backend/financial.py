class Financial:
    def __init__(self, conn):
        self.conn = conn

    def get_kpis(self):
        cursor = self.conn.cursor(dictionary=True)

        # --- Query de status (já implementada antes) ---
        cursor.execute("""
            SELECT status, COUNT(status) AS qtd
            FROM (
              SELECT 
                  CASE WHEN sr.status IS NULL THEN 'missing' ELSE sr.status END AS status
              FROM schedule_users su
              INNER JOIN schedules s ON su.schedule_id = s.id
              INNER JOIN clients c ON s.client_id = c.id
              LEFT JOIN schedule_reports sr ON s.id = sr.schedule_id
            ) tab
            GROUP BY status
        """)
        rows = cursor.fetchall()
        status_counts = {row["status"]: row["qtd"] for row in rows}
        total_agendas = sum(status_counts.values())

        # --- Query financeira (union corrente + anterior) ---
        cursor.execute("""
            SELECT
              u.id AS user_id,
              u.name,
              uc.contract_type,
              (
                CASE
                  WHEN uc.contract_type IN ('hourly_full','hourly_partial','scope')
                    THEN uc.base_value * uc.multiplier
                  ELSE 0
                END
              ) *
              SUM(CASE
                    WHEN sr.status IN ('approved','pending')
                         AND s.start_time >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                         AND s.start_time <  DATE_FORMAT(CURRENT_DATE + INTERVAL 1 MONTH, '%Y-%m-01')
                    THEN 1 ELSE 0
                  END)
              +
              CASE
                WHEN uc.contract_type = 'full_time'
                  AND uc.valid_from <= LAST_DAY(CURRENT_DATE)
                  AND (uc.valid_to IS NULL OR uc.valid_to >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'))
                THEN uc.base_value * uc.multiplier
                ELSE 0
              END AS total_mes,
              DATE_FORMAT(CURRENT_DATE, '%Y-%m') AS reference
            FROM users u
            JOIN user_contracts uc ON uc.user_id = u.id
            LEFT JOIN schedule_reports sr ON sr.user_id = u.id
            LEFT JOIN schedules s ON s.id = sr.schedule_id
            GROUP BY u.id, u.name, uc.contract_type, uc.base_value, uc.multiplier, uc.valid_from, uc.valid_to

            UNION ALL

            SELECT
              u.id AS user_id,
              u.name,
              uc.contract_type,
              (
                CASE
                  WHEN uc.contract_type IN ('hourly_full','hourly_partial','scope')
                    THEN uc.base_value * uc.multiplier
                  ELSE 0
                END
              ) *
              SUM(CASE
                    WHEN sr.status IN ('approved','pending')
                         AND s.start_time >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
                         AND s.start_time <  DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                    THEN 1 ELSE 0
                  END)
              +
              CASE
                WHEN uc.contract_type = 'full_time'
                  AND uc.valid_from <= LAST_DAY(CURRENT_DATE - INTERVAL 1 MONTH)
                  AND (uc.valid_to IS NULL OR uc.valid_to >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01'))
                THEN uc.base_value * uc.multiplier
                ELSE 0
              END AS total_mes,
              DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m') AS reference
            FROM users u
            JOIN user_contracts uc ON uc.user_id = u.id
            LEFT JOIN schedule_reports sr ON sr.user_id = u.id
            LEFT JOIN schedules s ON s.id = sr.schedule_id
            GROUP BY u.id, u.name, uc.contract_type, uc.base_value, uc.multiplier, uc.valid_from, uc.valid_to
        """)
        financial_rows = cursor.fetchall()

        # Estrutura: valores por usuário e total agregado por mês
        receita_por_usuario = {}
        receita_por_mes = {}

        for row in financial_rows:
            ref = row["reference"]
            receita_por_usuario.setdefault(ref, []).append({
                "user_id": row["user_id"],
                "name": row["name"],
                "contract_type": row["contract_type"],
                "total_mes": float(row["total_mes"])
            })
            receita_por_mes[ref] = receita_por_mes.get(ref, 0) + float(row["total_mes"])

        return {
            "statusCounts": status_counts,
            "totalAgendas": total_agendas,
            "receitaPorUsuario": receita_por_usuario,
            "receitaPorMes": receita_por_mes
        }
