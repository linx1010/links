import mysql.connector

class Clients:
    def __init__(self, conn):
        self.conn = conn

    def create_client(self, data):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO clients (organization_id, name, code, default_currency, payment_terms_days)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["organization_id"],
            data["name"],
            data.get("code"),
            data.get("default_currency", "BRL"),
            data.get("payment_terms_days", 15),
            
        ))
        self.conn.commit()
        client_id = cursor.lastrowid
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": client_id}

    def read_clients(self):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, organization_id, name, code, default_currency, payment_terms_days, created_at 
            FROM clients
        """)
        rows = cursor.fetchall()
        cursor.close()
        self.conn.close()
        return rows

    def update_client(self, data):
        cursor = self.conn.cursor()
        set_fields = []
        values = []

        for field in ["name", "code", "default_currency", "payment_terms_days"]:
            if field in data:
                set_fields.append(f"{field} = %s")
                values.append(data[field])

        if not set_fields:
            return {"status": "error", "message": "Nenhum campo para atualizar"}

        values.append(data["id"])
        query = f"""
            UPDATE clients 
            SET {', '.join(set_fields)} 
            WHERE id = %s
        """
        cursor.execute(query, tuple(values))
        self.conn.commit()
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": data["id"]}

    def delete_client(self, data):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM clients WHERE id = %s", (data["id"],))
        self.conn.commit()
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": data["id"]}
