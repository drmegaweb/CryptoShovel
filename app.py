from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('/var/www/myprojectenv/game.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            coins INTEGER,
            energy INTEGER,
            max_energy INTEGER,
            level INTEGER,
            tap_profit INTEGER,
            bonus_points INTEGER,
            chance_multiplier REAL,
            skin_multiplier REAL,
            skin_improved BOOLEAN
        )
    ''')
    conn.commit()
    conn.close()


@app.route('/get_user_data', methods=['GET'])
def get_user_data():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    conn = sqlite3.connect('/var/www/myprojectenv/game.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        user_data = {
            'user_id': user[0],
            'coins': user[1],
            'energy': user[2],
            'max_energy': user[3],
            'level': user[4],
            'tap_profit': user[5],
            'bonus_points': user[6],
            'chance_multiplier': user[7],
            'skin_multiplier': user[8],
            'skin_improved': user[9]
        }
        return jsonify(user_data)
    else:
        return jsonify({'error': 'User not found'}), 404


@app.route('/update_user_data', methods=['POST'])
def update_user_data():
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    conn = sqlite3.connect('/var/www/myprojectenv/game.db')
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE users
        SET coins = ?, energy = ?, max_energy = ?, level = ?, tap_profit = ?, bonus_points = ?, chance_multiplier = ?, skin_multiplier = ?, skin_improved = ?
        WHERE user_id = ?
    ''', (data['coins'], data['energy'], data['max_energy'], data['level'], data['tap_profit'], data['bonus_points'], data['chance_multiplier'], data['skin_multiplier'], data['skin_improved'], user_id))
    conn.commit()
    conn.close()
    
    if cursor.rowcount > 0:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Failed to update user data'}), 500

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
