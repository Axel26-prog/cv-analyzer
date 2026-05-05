import psycopg2
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="cv_analyzer",
    user="postgres",
    password="postgres"
)
print("Conectado!")
conn.close()