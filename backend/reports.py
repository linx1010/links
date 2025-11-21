import base64
import datetime

class Reports:
    def __init__(self, conn):
        self.conn = conn

    # --------------------------------------------------
    # UPLOAD DO RELATÓRIO
    # --------------------------------------------------
    def upload(self, data):
        try:
            cursor = self.conn.cursor()

            sql = """
                INSERT INTO schedule_reports 
                (schedule_id, user_id, report_date, file_path, notes, status, created_at) 
                VALUES (%s, %s, %s, %s, %s, 'pending', NOW())
            """

            # salvando arquivo em disco
            filename = f"/var/uploads/{data['schedule_id']}_{int(datetime.datetime.now().timestamp())}_{data['file_name']}"
            file_bytes = base64.b64decode(data["file_base64"])

            with open(filename, "wb") as f:
                f.write(file_bytes)

            params = (
                data["schedule_id"],
                data["user_id"],
                data["report_date"],
                filename,
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
