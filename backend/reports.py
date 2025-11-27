import base64
import datetime
import os
import re
from collections import defaultdict
from datetime import datetime

class Reports:
    def __init__(self, conn):
        self.conn = conn

    # --------------------------------------------------
    # UPLOAD DO RELATÓRIO
    # --------------------------------------------------

    def upload(self, data):
        try:
            cursor = self.conn.cursor()

            # diretório dinâmico via env, default = ./uploads
            upload_dir = os.environ.get("UPLOAD_DIR", os.path.join(os.getcwd(), "uploads"))
            os.makedirs(upload_dir, exist_ok=True)

            # sanitizar nome do arquivo
            safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', data['file_name'])
            filename = os.path.join(
                upload_dir,
                f"{data['schedule_id']}_{int(datetime.datetime.now().timestamp())}_{safe_name}"
            )

            file_bytes = base64.b64decode(data["file_base64"])
            with open(filename, "wb") as f:
                f.write(file_bytes)

            sql = """
                INSERT INTO schedule_reports 
                (schedule_id, user_id, report_date, file_path, file_name, notes, status, created_at) 
                VALUES (%s, %s, %s, %s, %s, %s, 'pending', NOW())
            """
            params = (
                data["schedule_id"],
                data["user_id"],
                data["report_date"],
                filename,
                safe_name,
                data.get("notes", "")
            )

            cursor.execute(sql, params)
            self.conn.commit()

            return {"status": True, "message": "Relatório enviado com sucesso"}

        except Exception as e:
            return {"status": False, "message": str(e)}



    # --------------------------------------------------
    # LISTAR RELATÓRIOS DE UM EVENTO
    # --------------------------------------------------
    def list(self, data):
        try:
            cursor = self.conn.cursor(dictionary=True)

            sql = """
                SELECT id, schedule_id, user_id, report_date, file_path, notes, status,
                       reviewed_by, reviewed_at, created_at
                FROM schedule_reports
                WHERE schedule_id = %s AND report_date = %s
                ORDER BY created_at DESC
            """

            cursor.execute(sql, (data["schedule_id"], data["report_date"]))
            result = cursor.fetchall()

            return {"status": True, "reports": result}

        except Exception as e:
            return {"status": False, "message": str(e)}


    # --------------------------------------------------
    # DOWNLOAD DO ARQUIVO
    # --------------------------------------------------
    def download(self, data):
        try:
            cursor = self.conn.cursor(dictionary=True)

            cursor.execute("SELECT file_path FROM schedule_reports WHERE id=%s", (data["report_id"],))
            result = cursor.fetchone()

            if not result:
                return {"status": False, "message": "Relatório não encontrado"}

            path = result["file_path"]

            with open(path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode()

            return {
                "status": True,
                "file_base64": encoded,
                "file_name": path.split("/")[-1]
            }

        except Exception as e:
            return {"status": False, "message": str(e)}


    # --------------------------------------------------
    # APROVAR / REJEITAR RELATÓRIO
    # --------------------------------------------------
    def approve(self, data):
        try:
            cursor = self.conn.cursor()

            sql = """
                UPDATE schedule_reports
                SET status = %s,
                    reviewed_by = %s,
                    reviewed_at = NOW()
                WHERE id = %s
            """

            status_text = "approved" if data["approve"] else "rejected"

            cursor.execute(sql, (
                status_text,
                data.get("reviewed_by", 0),
                data["report_id"]
            ))
            self.conn.commit()

            return {"status": True, "message": f"Relatório {status_text}"}

        except Exception as e:
            return {"status": False, "message": str(e)}
        
    def pending_by_lead(self, data):
        lead_id = data.get("lead_id")
        cursor = self.conn.cursor(dictionary=True)

        query = """
            SELECT 
                s.id AS schedule_id,
                c.id AS client_id,
                c.name AS client_name,
                su.user_id,
                u.name AS user_name,
                s.start_time,
                CASE WHEN sr.status IS NULL THEN 'missing' ELSE sr.status END AS status
            FROM schedules s
            INNER JOIN clients c ON s.client_id = c.id
            LEFT JOIN schedule_users su ON su.schedule_id = s.id
            LEFT JOIN users u ON u.id = su.user_id
            LEFT JOIN schedule_reports sr ON sr.schedule_id = s.id AND sr.user_id = su.user_id
            WHERE s.lead_id = %s
        """
        cursor.execute(query, (lead_id,))
        rows = cursor.fetchall()

        # Agrupar por cliente
        grouped = {}
        for row in rows:
            cid = row["client_id"]
            if cid not in grouped:
                grouped[cid] = {
                    "client_id": cid,
                    "client_name": row["client_name"],
                    "schedules": []
                }
            grouped[cid]["schedules"].append({
                "schedule_id": row["schedule_id"],
                "start_time": row["start_time"],
                "user_id": row["user_id"],
                "user_name": row["user_name"],
                "status": row["status"]
            })

        return list(grouped.values())
    
    def list_by_user_status(self, data):
        user_id = data.get("user_id")
        cursor = self.conn.cursor(dictionary=True)

        query = """
            SELECT
                s.id AS schedule_id,
                su.user_id,
                c.id AS client_id,
                c.name AS client_name,
                s.start_time,
                CASE
                    WHEN sr.id IS NULL THEN 'missing'
                    ELSE sr.status
                END AS status
            FROM schedule_users su
            INNER JOIN schedules s ON s.id = su.schedule_id
            INNER JOIN clients c ON c.id = s.client_id
            LEFT JOIN schedule_reports sr
                ON sr.schedule_id = su.schedule_id
                AND sr.user_id = su.user_id
            WHERE su.user_id = %s
            AND (
                sr.id IS NULL           -- sem envio -> missing
                OR sr.status IN ('pending', 'rejected')  -- enviados mas não aprovados
            )
            ORDER BY s.start_time ASC
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()

        return rows
    
    def dashboard_totals(self, data):
        lead_id = data.get("lead_id")
        user_id = data.get("user_id")

        # usa os defs já existentes
        approval_data = self.pending_by_lead({"lead_id": lead_id})
        upload_data = self.list_by_user_status({"user_id": user_id})

        # inicializa acumuladores
        approval_totals = {"missing": 0, "pending": 0, "rejected": 0, "approved": 0}
        upload_totals = {"missing": 0, "pending": 0, "rejected": 0}
        global_totals = defaultdict(int)
        monthly_totals = defaultdict(lambda: {"missing": 0, "pending": 0, "rejected": 0, "approved": 0})

        # percorre approval
        for client in approval_data:
            for s in client["schedules"]:
                status = s["status"]
                approval_totals[status] = approval_totals.get(status, 0) + 1
                global_totals[status] += 1

                # agrupar por mês/ano
                start_time = s["start_time"]
                if isinstance(start_time, datetime):
                    dt = start_time
                else:
                    dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")

                key = dt.strftime("%Y-%m")
                monthly_totals[key][status] += 1

        # percorre upload
        for r in upload_data:
            status = r["status"]
            upload_totals[status] = upload_totals.get(status, 0) + 1
            global_totals[status] += 1

            start_time = r["start_time"]
            if isinstance(start_time, datetime):
                dt = start_time
            else:
                dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")

            key = dt.strftime("%Y-%m")
            monthly_totals[key][status] += 1

        # pegar últimos 3 meses ordenados
        sorted_months = sorted(monthly_totals.keys(), key=lambda m: datetime.strptime(m, "%Y-%m"))[-3:]
        monthly_data = [
            {
                "month": datetime.strptime(m, "%Y-%m").strftime("%B/%Y"),  # ex: "Novembro/2025"
                **monthly_totals[m]
            }
            for m in sorted_months
        ]


        return {
            "approval": approval_totals,
            "upload": upload_totals,
            "global": dict(global_totals),   # para o pie chart
            "monthly": monthly_data          # para o bar chart empilhado
        }

