/**
 * NO TOCAR ESTE ARCHIVO: Es generado automaticamente, si sabes lo que haces adelante ;)
 * de lo contrario mejor ir a la documentacion o al servidor de discord link.codigoencasa.com/DISCORD
 */
"use strict";

const { createClient } = require("@libsql/client");
var require$$0 = require("@libsql/client/web");

const turso = require$$0;

class TursoAdapter {
  db;
  listHistory = [];
  credentials = { url: null, authToken: null };

  constructor(_credentials) {
    this.credentials = _credentials;
    this.init();
  }

  async init() {
    this.db = createClient(this.credentials);
  }

  getPrevByNumber = async (from) => {
    const sql = `SELECT * FROM history WHERE phone = :phone ORDER BY id DESC LIMIT 1`;
    try {
      const { rows } = await this.db.execute({
        sql: sql,
        args: { phone: from },
      });

      if (rows.length > 0) {
        // Crear una copia del objeto unicaRow
        const unicaRow = { ...rows[0] };

        unicaRow.options = JSON.parse(unicaRow.options);

        return unicaRow;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching previous number:", error);
      throw error;
    }
  };

  save = async (ctx) => {
    const sql =
      "INSERT INTO history VALUES (:id, :ref, :keyword, :answer, :refSerialize, :phone, :options, :created_at)";

    try {
      const isSaved = await this.db.execute({
        sql: sql,
        args: {
          id: null,
          ref: ctx.ref,
          keyword: ctx.keyword,
          answer: ctx.answer,
          refSerialize: ctx.refSerialize,
          phone: ctx.from,
          options: JSON.stringify(ctx.options),
          created_at: null,
        },
      });
      console.log("Guardando en DB:", ctx);
    } catch (error) {
      console.log("Error saving number:", error);
    }
  };

  createTable = async () => {
    const tableName = "history";
    const sql = `CREATE TABLE ${tableName} 
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    ref TEXT NOT NULL,
                    keyword TEXT,
                    answer TEXT NOT NULL,
                    refSerialize TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    options TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;

    const result = await this.db.execute(sql);
    console.log(`Tabla ${tableName} creada correctamente `);
  };

  checkTableExists = async () => {
    let sql =
      "SELECT name FROM sqlite_master WHERE type='table' AND name='history';";
    const result = await this.db.execute(sql);

    try {
      if (result.rows.length > 0) {
        console.log("Table exists.");
      } else {
        await createTable();
      }
    } catch (error) {
      console.log("Ha ocurrido un error creando la tabla History:", error);
    }
  };
}

var turso_1 = TursoAdapter;

module.exports = turso_1;
