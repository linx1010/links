import mysql.connector
import jwt
import datetime
import bcrypt   # ✅ IMPORTANTE: faltava importar bcrypt

SECRET_KEY = "sua_chave_super_secreta"  # ⚠️ troque por algo seguro e mantenha fora do código (ex: variável de ambiente)

def generate_jwt(user):
    """
    Gera um token JWT com informações básicas do usuário.
    """
    payload = {
        "id": user["id"],
        "email": user.get("email"),
        "role": user.get("role"),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)  # expira em 1h
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

class Users():
    def __init__(self, conn):
        self.conn = conn

    def create_user(self, data):
        cursor = self.conn.cursor()
        password = data.get("password", "")
        # Criptografa a senha com bcrypt
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        cursor.execute("""
            INSERT INTO users (organization_id, name, email, role, hourly_rate, active, password_hash)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data["organization_id"],
            data["name"],
            data.get("email"),
            data.get("role", "member"),
            data.get("hourly_rate", 0.0),
            data.get("active", True),
            password_hash
        ))
        self.conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        return {"status": "ok", "id": user_id}

    def login(self, data):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email=%s", (data['email'],))
        user = cursor.fetchone()
        cursor.close()

        # ✅ Verifica se usuário existe e se senha confere com hash
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
            return {"status": True, "token": generate_jwt(user), "role": user['role'],"id":user['id']}
        else:
            return {"status": False, "message": "Usuário ou senha inválidos"}

    def read_users(self):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, organization_id, name, email, role, hourly_rate, active, created_at, updated_at
            FROM users
        """)
        rows = cursor.fetchall()

        # adiciona lista de módulos para cada usuário
        for user in rows:
            cursor_mod = self.conn.cursor(dictionary=True)
            cursor_mod.execute("""
                SELECT module_code
                FROM user_modules
                WHERE user_id = %s AND organization_id = %s
            """, (user['id'], user['organization_id']))
            user['modulos'] = [row['module_code'] for row in cursor_mod.fetchall()]
            cursor_mod.close()

        cursor.close()
        return rows

    def read_user_by_id(self, data):
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute("SELECT id, organization_id, name, email, role, hourly_rate, active, created_at, updated_at FROM users WHERE id = %s", (data["id"],))
        rows = cursor.fetchall()
        cursor.close()
        if rows:
            user = rows[0]
            cursor_mod = self.conn.cursor(dictionary=True)
            cursor_mod.execute("""
                SELECT module_code
                FROM user_modules
                WHERE user_id = %s AND organization_id = %s
            """, (user['id'], user['organization_id']))
            user['modulos'] = [row['module_code'] for row in cursor_mod.fetchall()]
            cursor_mod.close()
            rows[0] = user

        cursor.close()
        return rows[0] if rows else None

    def update_user(self, data):
        cursor = self.conn.cursor()
        set_fields = []
        values = []

        for field in ["name", "email", "role", "hourly_rate", "active", "password"]:
            if field in data:
                if field == "password":
                    # ✅ Atualiza senha com hash
                    hashed = bcrypt.hashpw(data[field].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    set_fields.append("password_hash = %s")
                    values.append(hashed)
                else:
                    set_fields.append(f"{field} = %s")
                    values.append(data[field])

        if not set_fields:
            return {"status": "error", "message": "Nenhum campo para atualizar"}

        values.append(data["id"])
        query = f"UPDATE users SET {', '.join(set_fields)}, updated_at = NOW() WHERE id = %s"
        cursor.execute(query, tuple(values))
        
        # atualiza módulos vinculados
        self._update_user_modules(data['id'], data['organization_id'], data.get('modulos', []))

        self.conn.commit()
        cursor.close()
        return {"status": "ok", "id": data["id"]}

    def delete_user(self, data):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = %s", (data["id"],))
        self.conn.commit()
        cursor.close()
        return {"status": "ok", "id": data["id"]}
    
    def _update_user_modules(self, user_id, org_id, modules):
        cursor = self.conn.cursor()
        # remove vínculos antigos
        cursor.execute("DELETE FROM user_modules WHERE user_id=%s AND organization_id=%s", (user_id, org_id))
        # insere novos vínculos
        for code in modules:
            cursor.execute("""
                INSERT INTO user_modules (user_id, module_code, organization_id, proficiency_score)
                VALUES (%s, %s, %s, 1)
            """, (user_id, code, org_id))
        cursor.close()
