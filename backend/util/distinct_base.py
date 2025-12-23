import sqlparse
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ddl_old_path = os.path.join(BASE_DIR, "old_schema", "01-schema.sql")
ddl_new_path = os.path.join(BASE_DIR, "..", "initdb", "01-schema.sql")

def parse_ddl(file):
    with open(file, 'r') as f:
        content = f.read()
    statements = sqlparse.parse(content)
    tables = {}
    for stmt in statements:
        if stmt.get_type() == 'CREATE':
            table_name = stmt.get_name()
            columns = []
            for token in stmt.tokens:
                if isinstance(token, sqlparse.sql.Parenthesis):
                    for col in token.tokens:
                        if isinstance(col, sqlparse.sql.Identifier):
                            columns.append(col.get_name())
            tables[table_name] = columns
    return tables

ddl_old = parse_ddl(ddl_old_path)
ddl_new = parse_ddl(ddl_new_path)

for table in ddl_new:
    if table not in ddl_old:
        print(f"CREATE TABLE {table} ...")
    else:
        missing = set(ddl_new[table]) - set(ddl_old[table])
        for col in missing:
            print(f"ALTER TABLE {table} ADD COLUMN {col} ...")
