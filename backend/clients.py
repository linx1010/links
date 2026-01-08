import mysql.connector

class Clients:
    def __init__(self, conn):
        self.conn = conn

    # ============================================================
    # CLIENTES
    # ============================================================

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

    # ============================================================
    # CONTATOS DO CLIENTE
    # ============================================================

    def get_contacts(self, client_id):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, client_id, name, email, phone, role, active
            FROM client_contacts
            WHERE client_id = %s
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        self.conn.close()
        return rows

    def add_contact(self, data):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO client_contacts (client_id, name, email, phone, role, active)
            VALUES (%s, %s, %s, %s, %s, 1)
        """, (
            data["client_id"],
            data["name"],
            data.get("email"),
            data.get("phone"),
            data.get("role")
        ))
        self.conn.commit()
        contact_id = cursor.lastrowid
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": contact_id}

    def delete_contact(self, data):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM client_contacts WHERE id = %s", (data["id"],))
        self.conn.commit()
        cursor.close()
        self.conn.close()
        return {"status": "ok"}

    # ============================================================
    # CONTRATOS DO CLIENTE
    # ============================================================

    def get_contracts(self, client_id):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, client_id, contract_type, base_value, multiplier, valid_from, valid_to
            FROM client_contracts
            WHERE client_id = %s
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        self.conn.close()
        return rows

    def add_contract(self, data):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO client_contracts (client_id, contract_type, base_value, multiplier, valid_from, valid_to)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data["client_id"],
            data["contract_type"],
            data["base_value"],
            data.get("multiplier", 1),
            data["valid_from"],
            data.get("valid_to") or None
        ))
        self.conn.commit()
        contract_id = cursor.lastrowid
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": contract_id}

    def delete_contract(self, data):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM client_contracts WHERE id = %s", (data["id"],))
        self.conn.commit()
        cursor.close()
        self.conn.close()
        return {"status": "ok"}

    # ============================================================
    # INVOICES DO CLIENTE
    # ============================================================

    def get_invoices(self, client_id):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, client_id, invoice_number, amount, status, file_path, created_at
            FROM client_invoices
            WHERE client_id = %s
        """, (client_id,))
        rows = cursor.fetchall()
        cursor.close()
        self.conn.close()
        return rows

    def add_invoice(self, data):
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO client_invoices (client_id, invoice_number, amount, status, file_path)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["client_id"],
            data["invoice_number"],
            data["amount"],
            data.get("status", "pending"),
            data.get("file_path")
        ))
        self.conn.commit()
        invoice_id = cursor.lastrowid
        cursor.close()
        self.conn.close()
        return {"status": "ok", "id": invoice_id}

    def delete_invoice(self, data):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM client_invoices WHERE id = %s", (data["id"],))
        self.conn.commit()
        cursor.close()
        self.conn.close()
        return {"status": "ok"}
