import mysql.connector

class Calendar:
    def __init__(self, conn):
        self.conn = conn
    
    def getCalendar(self, data):
        cursor = self.conn.cursor(dictionary=True)
        eventos = []

        client_name = None
        if data['type'] == 'client':
            cursor.execute("SELECT name FROM clients WHERE id = %s", (data['id'],))
            result = cursor.fetchone()
            client_name = result['name'] if result else None

            query = """
                SELECT 
                    'schedule' AS source,
                    s.id,
                    s.title,
                    s.start_time,
                    s.end_time,
                    s.location,
                    s.status,
                    NULL AS description
                FROM schedules s
                WHERE s.client_id = %s

                UNION ALL

                SELECT 
                    'project' AS source,
                    p.id,
                    p.name AS title,
                    p.start_date AS start_time,
                    p.end_date AS end_time,
                    NULL AS location,
                    p.status,
                    NULL AS description
                FROM projects p
                WHERE p.client_id = %s
                ORDER BY start_time ASC;
            """
            cursor.execute(query, (data['id'], data['id']))
            eventos = cursor.fetchall()

        elif data['type'] == 'user':
            query = """
                SELECT 
                    'schedule' AS source,
                    s.id,
                    s.title,
                    s.start_time,
                    s.end_time,
                    s.location,
                    s.status,
                    s.description,
                    c.name AS client_name
                FROM schedule_users su
                INNER JOIN schedules s ON su.schedule_id = s.id
                INNER JOIN clients c ON s.client_id = c.id
                WHERE su.user_id = %s
                ORDER BY s.start_time ASC;
            """
            cursor.execute(query, (data['id'],))
            eventos = cursor.fetchall()

        cursor.close()
        self.conn.close()

        resultado = []
        for e in eventos:
            resultado.append({
                "id": e["id"],
                "title": e["title"] or "Evento",
                "start_time": e["start_time"],
                "end_time": e["end_time"],
                "title": e["title"],
                "location": e["location"],
                "source": e["source"],
                "status": e["status"],
                "description": e.get("description"),
                "client_name": e.get("client_name") or client_name
            })

        return resultado


        
    def createCalendar(self, data):
        cursor = self.conn.cursor()

        try:
            # Extrair dados principais
            start_time = f"{data['date']} 00:00:00"
            location = data.get('location', None)
            lead_id = data.get('lead_id')
            role = data.get('role', 'participant')
            user_ids = data.get('user_id', [])

            # Normalizar lista de usuários
            if not isinstance(user_ids, list):
                user_ids = [user_ids]

            # 🔎 Validação: máximo 2 agendas por usuário no mesmo dia
            for user_id in user_ids:
                check_query = """
                    SELECT COUNT(*) 
                    FROM schedules s
                    INNER JOIN schedule_users su ON su.schedule_id = s.id
                    WHERE su.user_id = %s
                    AND DATE(s.start_time) = DATE(%s)
                """
                cursor.execute(check_query, (user_id, start_time))
                (count,) = cursor.fetchone()

                if count >= 2:
                    return {
                        "success": False,
                        "error": "Usuário já possui 2 agendas neste dia.",
                        "user_id": user_id
                    }

            # 1. Inserir na tabela schedules
            insert_schedule = """
                INSERT INTO schedules (client_id, title, start_time, location, lead_id)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_schedule, (data['id'], data['title'], start_time, location, lead_id))
            schedule_id = cursor.lastrowid

            # 2. Associar múltiplos usuários na tabela schedule_users
            insert_user = """
                INSERT INTO schedule_users (schedule_id, user_id, role)
                VALUES (%s, %s, %s)
            """
            for user_id in user_ids:
                cursor.execute(insert_user, (schedule_id, user_id, role))

            self.conn.commit()
            return {"success": True, "schedule_id": schedule_id}

        except Exception as e:
            self.conn.rollback()
            return {"success": False, "error": str(e)}

        finally:
            cursor.close()
            self.conn.close()


        
    def createCalendarBatch(self, data):
        cursor = self.conn.cursor()
        results = []

        try:
            dates = data.get('dates', [])
            client_id = data['id']
            title = data['title']
            description = data.get('description', None)
            location = data.get('location', None)
            role = data.get('role', 'participant')
            user_ids = data.get('user_id', [])

            from datetime import datetime

            for date in dates:
                try:
                    # Bloqueia datas retroativas
                    if datetime.strptime(date, "%Y-%m-%d").date() < datetime.today().date():
                        results.append({"date": date, "success": False, "error": "Data retroativa"})
                        continue

                    # Validação de conflito: já existe evento para este cliente nesta data?
                    cursor.execute(
                        "SELECT id FROM schedules WHERE client_id = %s AND DATE(start_time) = %s",
                        (client_id, date)
                    )
                    if cursor.fetchone():
                        results.append({"date": date, "success": False, "error": "Conflito de agenda"})
                        continue

                    # 1. Inserir schedule
                    insert_schedule = """
                        INSERT INTO schedules (client_id, title, description, start_time, location)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    start_time = f"{date} 00:00:00"
                    cursor.execute(insert_schedule, (client_id, title, description, start_time, location))
                    schedule_id = cursor.lastrowid

                    # 2. Associar usuários
                    insert_user = """
                        INSERT INTO schedule_users (schedule_id, user_id, role)
                        VALUES (%s, %s, %s)
                    """
                    if isinstance(user_ids, list):
                        for user_id in user_ids:
                            cursor.execute(insert_user, (schedule_id, user_id, role))
                    else:
                        cursor.execute(insert_user, (schedule_id, user_ids, role))

                    results.append({"date": date, "success": True, "schedule_id": schedule_id})

                except Exception as e:
                    results.append({"date": date, "success": False, "error": str(e)})

            self.conn.commit()
            return {"success": True, "results": results}

        except Exception as e:
            self.conn.rollback()
            return {"success": False, "error": str(e)}

        finally:
            cursor.close()
            self.conn.close()

    
    def deleteCalendar(self, data):
        cursor = self.conn.cursor()

        try:
            schedule_id = data['schedule_id']

            # 1. Remover associações de usuários
            cursor.execute("DELETE FROM schedule_users WHERE schedule_id = %s", (schedule_id,))

            # 2. Remover o evento
            cursor.execute("DELETE FROM schedules WHERE id = %s", (schedule_id,))

            self.conn.commit()
            return { "success": True }

        except Exception as e:
            self.conn.rollback()
            return { "success": False, "error": str(e) }

        finally:
            cursor.close()
            self.conn.close()
            
    def updateCalendar(self, data):
        cursor = self.conn.cursor()
        try:
            update = """
                UPDATE schedules
                SET title = %s,
                    description = %s,
                    start_time = %s,
                    end_time = %s,
                    location = %s,
                    status = %s
                WHERE id = %s
            """
            cursor.execute(update, (
                data['title'],
                data['description'],
                data['start_time'],
                data['end_time'],
                data['location'],
                data.get('status', 'open'),
                data['id']
            ))
            self.conn.commit()
            return { "success": True }
        except Exception as e:
            self.conn.rollback()
            return { "success": False, "error": str(e) }

