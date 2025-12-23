import mysql.connector
from datetime import datetime

class Operational:
    def __init__(self, conn):
        self.conn = conn

    def hours_by_client(self):
        cursor = self.conn.cursor(dictionary=True)

        # Intervalo de 7 meses
        cursor.execute("""
            SET @start_date = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01');
        """)
        cursor.execute("""
            SET @end_date = LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 3 MONTH));
        """)

        # 1) Apenas uma consulta ao banco
        cursor.execute("""
            SELECT 
                s.client_id,
                DATE_FORMAT(s.start_time, '%Y%m%d') AS referencia,
                s.status,
                TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) / 60 AS horas
            FROM schedules s
            WHERE s.start_time BETWEEN @start_date AND @end_date
              AND s.end_time IS NOT NULL
              AND TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) <> 0
            ORDER BY s.client_id, referencia, s.status;
        """)

        rows = cursor.fetchall()
        cursor.close()

        # 2) Montagem dos totalizadores no Python
        totais_status = {}
        total_geral = 0

        for row in rows:
            horas = float(row["horas"])
            status = row["status"]

            # total por status
            if status not in totais_status:
                totais_status[status] = 0
            totais_status[status] += horas

            # total geral
            total_geral += horas

        return {
            "status": True,
            "period": "3 months before and after current month",
            "detalhes": rows,
            "totais_por_status": totais_status,
            "total_geral": total_geral
        }
    
    def hours_by_resource(self):
        cursor = self.conn.cursor(dictionary=True)

        cursor.execute("""
            SET @start_date = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01');
        """)
        cursor.execute("""
            SET @end_date = LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 3 MONTH));
        """)

        # 1) Consulta única (1 linha por schedule)
        cursor.execute("""
            SELECT 
                su.user_id,
                DATE_FORMAT(s.start_time, '%Y%m%d') AS referencia,
                COALESCE(sr.status, 'missing') AS status,
                TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) / 60 AS horas,
                s.client_id
            FROM schedules s
            JOIN schedule_users su ON su.schedule_id = s.id
            LEFT JOIN schedule_reports sr 
                ON sr.schedule_id = s.id
                AND sr.user_id = su.user_id
                AND sr.report_date = DATE(s.start_time)
            WHERE s.start_time BETWEEN @start_date AND @end_date
            AND s.end_time IS NOT NULL
            AND TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time) <> 0
            ORDER BY su.user_id, referencia;
        """)

        schedules = cursor.fetchall()
        cursor.close()

        # 2) Totalizadores corretos (por schedule)
        totais_status = {}
        totais_por_recurso = {}
        total_geral = 0

        for row in schedules:
            horas = float(row["horas"])
            status = row["status"]
            user_id = row["user_id"]

            totais_status[status] = totais_status.get(status, 0) + horas
            totais_por_recurso[user_id] = totais_por_recurso.get(user_id, 0) + horas
            total_geral += horas

        # 3) Detalhe diário (agrupado por user + dia)
        detalhe = {}
        for row in schedules:
            key = (row["user_id"], row["referencia"])
            if key not in detalhe:
                detalhe[key] = {
                    "user_id": row["user_id"],
                    "referencia": row["referencia"],
                    "horas": 0,
                    "clientes": set(),
                    "status": set()
                }

            detalhe[key]["horas"] += float(row["horas"])
            detalhe[key]["clientes"].add(row["client_id"])
            detalhe[key]["status"].add(row["status"])

        # 4) Converte sets para strings
        detalhes_final = []
        for k, d in detalhe.items():
            detalhes_final.append({
                "user_id": d["user_id"],
                "referencia": d["referencia"],
                "horas": d["horas"],
                "clientes": ",".join(str(c) for c in sorted(d["clientes"])),
                "status": ",".join(sorted(d["status"]))
            })

        return {
            "status": True,
            "period": "3 months before and after current month",
            "detalhes": detalhes_final,
            "totais_por_status": totais_status,
            "totais_por_recurso": totais_por_recurso,
            "total_geral": total_geral
        }

