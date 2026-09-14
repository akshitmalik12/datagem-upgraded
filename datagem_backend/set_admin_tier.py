import sqlite3
conn = sqlite3.connect('datagem.db')
cursor = conn.cursor()
cursor.execute('UPDATE users SET tier = "enterprise" WHERE email = "aakshitmalik@gmail.com"')
conn.commit()
conn.close()
