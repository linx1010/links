import pika
import json
import mysql.connector

# Configurações do MySQL
class Timesheet:
    def __init__(self, conn):
        self.conn = conn

    def kread_timesheet(self, data):
        user_id = data.get("user_id")
        week_start = data.get("week_start_date")
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT p.name AS project_name, t.name AS task_name, te.task_id, te.project_id,
                   DAYNAME(te.started_at) AS dia, SUM(te.duration_minutes)/60 AS horas
            FROM time_entries te
            JOIN projects p ON te.project_id = p.id
            JOIN tasks t ON te.task_id = t.id
            WHERE te.user_id = %s AND DATE(te.started_at) >= %s AND DATE(te.started_at) < DATE_ADD(%s, INTERVAL 7 DAY)
            GROUP BY te.project_id, te.task_id, dia
        """
        cursor.execute(query, (user_id, week_start, week_start))
        rows = cursor.fetchall()

        # Agrupar por projeto/tarefa e distribuir por dia
        resultado = {}
        for row in rows:
            key = f"{row['project_id']}_{row['task_id']}"
            if key not in resultado:
                resultado[key] = {
                    "project_name": row["project_name"],
                    "task_name": row["task_name"],
                    "horas": {d: 0 for d in ['mon','tue','wed','thu','fri','sat','sun']}
                }
            dia = row["dia"].lower()[:3]  # ex: 'monday' → 'mon'
            resultado[key]["horas"][dia] = row["horas"]

        return list(resultado.values())

    def save_timesheet(self, data):
        user_id = data.get("user_id")
        week_start = data.get("week_start_date")
        entries = data.get("entries", [])
        cursor = self.conn.cursor()

        for entry in entries:
            for dia, horas in entry["horas"].items():
                if horas > 0:
                    dia_map = {
                        "mon": 0, "tue": 1, "wed": 2,
                        "thu": 3, "fri": 4, "sat": 5, "sun": 6
                    }
                    dia_offset = dia_map[dia]
                    started_at = f"{week_start} 08:00:00"
                    ended_at = f"{week_start} 08:00:00"
                    query = """
                        INSERT INTO time_entries (user_id, project_id, task_id, started_at, ended_at, duration_minutes, description, organization_id)
                        VALUES (%s, %s, %s, DATE_ADD(%s, INTERVAL %s DAY), DATE_ADD(%s, INTERVAL %s DAY), %s, %s, %s)
                    """
                    cursor.execute(query, (
                        user_id,
                        entry["project_id"],
                        entry["task_id"],
                        week_start,
                        dia_offset,
                        week_start,
                        dia_offset,
                        int(horas * 60),
                        "Lançamento via timesheet",
                        1  # mockado
                    ))
        self.conn.commit()
        return {"status": True, "message": "Timesheet salvo com sucesso"}
