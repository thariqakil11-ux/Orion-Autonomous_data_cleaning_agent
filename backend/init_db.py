import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from config import settings

def create_database():
    try:
        # Connect to default 'postgres' database to create the new db
        con = psycopg2.connect(
            dbname='postgres', 
            user=settings.DB_USER, 
            host=settings.DB_HOST, 
            password=settings.DB_PASSWORD
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{settings.DB_NAME}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Database '{settings.DB_NAME}' does not exist. Creating...")
            cur.execute(f"CREATE DATABASE {settings.DB_NAME}")
            print(f"Database '{settings.DB_NAME}' created successfully.")
        else:
            print(f"Database '{settings.DB_NAME}' already exists.")
            
        cur.close()
        con.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
