import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    // 1. Crear la tabla si no existe (ejemplo de clientes/ventas)
    await sql`
      CREATE TABLE IF NOT EXISTS registros (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        detalle TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Si envían datos (método POST), los guardamos
    if (request.method === 'POST') {
      const { nombre, detalle } = request.body;
      const resultado = await sql`
        INSERT INTO registros (nombre, detalle) 
        VALUES (${nombre}, ${detalle}) 
        RETURNING *;
      `;
      return response.status(200).json({ success: true, data: resultado.rows[0] });
    } 
    
    // 3. Si piden datos (método GET), los devolvemos
    if (request.method === 'GET') {
      const registros = await sql`SELECT * FROM registros ORDER BY id DESC;`;
      return response.status(200).json({ success: true, data: registros.rows });
    }

    return response.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
