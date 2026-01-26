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

    def get_contract_balance(self, contract_id):
        cursor = self.conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                SUM(hours_added - hours_used - hours_expired) AS balance
            FROM client_contract_hours_balance
            WHERE contract_id = %s
            AND valid_until >= CURDATE()
        """, (contract_id,))

        row = cursor.fetchone()
        cursor.close()
        self.conn.close()

        return {"contract_id": contract_id, "balance": row["balance"] or 0}

    def get_contract_history(self, contract_id):
        cursor = self.conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                month_year,
                hours_added,
                hours_used,
                hours_expired,
                valid_until
            FROM client_contract_hours_balance
            WHERE contract_id = %s
            ORDER BY month_year DESC
        """, (contract_id,))

        rows = cursor.fetchall()
        cursor.close()
        self.conn.close()

        return rows

    def consume_contract_hours(self, data):
        contract_id = data["contract_id"]
        hours_to_consume = float(data["hours"])

        cursor = self.conn.cursor(dictionary=True)

        # Buscar meses válidos (FIFO)
        cursor.execute("""
            SELECT id, hours_added, hours_used, hours_expired
            FROM client_contract_hours_balance
            WHERE contract_id = %s
            AND valid_until >= CURDATE()
            ORDER BY month_year ASC
        """, (contract_id,))

        months = cursor.fetchall()

        remaining = hours_to_consume

        for m in months:
            available = m["hours_added"] - m["hours_used"] - m["hours_expired"]

            if available <= 0:
                continue

            consume = min(available, remaining)

            cursor.execute("""
                UPDATE client_contract_hours_balance
                SET hours_used = hours_used + %s
                WHERE id = %s
            """, (consume, m["id"]))

            remaining -= consume

            if remaining <= 0:
                break

        self.conn.commit()
        cursor.close()
        self.conn.close()

        return {
            "status": "ok",
            "contract_id": contract_id,
            "requested": hours_to_consume,
            "remaining_unconsumed": remaining
        }

    def expire_old_hours(self, contract_id):
        cursor = self.conn.cursor()

        cursor.execute("""
            UPDATE client_contract_hours_balance
            SET hours_expired = hours_added - hours_used
            WHERE contract_id = %s
            AND valid_until < CURDATE()
            AND hours_expired = 0
        """, (contract_id,))

        self.conn.commit()
        cursor.close()
        self.conn.close()

        return {"status": "ok", "expired_rows": cursor.rowcount}
