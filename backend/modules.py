import mysql.connector

class Modules:
    def __init__(self, conn):
        self.conn = conn

    def read_modules(self):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("SELECT code, organization_id, label, description, active FROM modules WHERE active = 1")
        rows = cursor.fetchall()
        cursor.close()
        return rows