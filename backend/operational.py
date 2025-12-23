import mysql.connector
from datetime import datetime

class Operational:
    def __init__(self, conn):
        self.conn = conn

    def hours_by_client(self):
        cursor = self.conn.cursor(dictionary=True)

        cursor.execute("""
            SET @start_date = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 3 MONTH), '%Y-%m-01');
        """)
        cursor.execute("""
            SET @end_date = LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 3 MONTH));
        """)

        cursor.execute("""
            SELECT
                s.id AS schedule_id,
                s.client_id,
                DATE(s.start_time) AS data,
                COUNT(DISTINCT su.user_id) AS total_recursos,
                COUNT(DISTINCT sr.user_id) AS total_reports,
                SUM(CASE WHEN sr.status = 'approved' THEN 1 ELSE 0 END) AS total_aprovados
            FROM schedules s
            LEFT JOIN schedule_users su ON su.schedule_id = s.id
            LEFT JOIN schedule_reports sr 
                ON sr.schedule_id = s.id
                AND sr.report_date = DATE(s.start_time)
            WHERE s.start_time BETWEEN @start_date AND @end_date
            GROUP BY s.id, s.client_id, DATE(s.start_time)
            ORDER BY s.client_id, data;
        """)

        rows = cursor.fetchall()
        cursor.close()

        totais_por_status = {
            "no_resources": 0,
            "pending": 0,
            "in_progress": 0,
            "completed": 0
        }

        detalhes = []

        for row in rows:
            total_recursos = row["total_recursos"]
            total_reports = row["total_reports"]
            total_aprovados = row["total_aprovados"] or 0

            # CLASSIFICAÇÃO FINAL
            if total_recursos == 0:
                status = "no_resources"
            elif total_reports == 0:
                status = "pending"
            elif total_aprovados == total_recursos:
                status = "completed"
            else:
                status = "in_progress"

            totais_por_status[status] += 1

            detalhes.append({
                "schedule_id": row["schedule_id"],
                "client_id": row["client_id"],
                "data": row["data"],
                "status": status
            })

        return {
            "status": True,
            "period": "3 months before and after current month",
            "detalhes": detalhes,
            "totais_por_status": totais_por_status,
            "total_agendas": len(rows)
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

    def get_timesheet_resources(self, mes, ano):
        cursor = self.conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                su.user_id,
                u.name AS recurso,
                s.client_id,
                c.name AS cliente,
                s.start_time,
                s.end_time
            FROM schedules s
            JOIN schedule_users su ON su.schedule_id = s.id
            JOIN users u ON u.id = su.user_id
            JOIN clients c ON c.id = s.client_id
            WHERE MONTH(s.start_time) = %s
            AND YEAR(s.start_time) = %s
            ORDER BY u.name, s.start_time;
        """, (mes, ano))

        rows = cursor.fetchall()
        cursor.close()

        recursos = {}

        for row in rows:
            nome = row["recurso"]
            dia = row["start_time"].day
            horas = (row["end_time"] - row["start_time"]).seconds / 3600

            if nome not in recursos:
                recursos[nome] = [{"dia": d, "horas": None, "agendas": []} for d in range(1, 32)]

            recursos[nome][dia - 1]["horas"] = horas
            recursos[nome][dia - 1]["agendas"].append({
                "cliente": row["cliente"],
                "start_time": row["start_time"].strftime("%H:%M"),
                "end_time": row["end_time"].strftime("%H:%M")
            })

        return {
            "status": True,
            "mes": mes,
            "ano": ano,
            "recursos": [
                {"nome": nome, "dias": dias}
                for nome, dias in recursos.items()
            ]
        }
