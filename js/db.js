import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function connect() {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('_schema')
      .select('*')
      .limit(1)
    
    if (error) throw error
    console.log('Connected to Supabase database')
  } catch (error) {
    console.error('Error connecting to database:', error)
    throw error
  }
}

async function query(sql, params) {
  try {
    // Note: This is a simplified example. You'll need to convert your MySQL queries
    // to use Supabase's query builder syntax for each specific case
    const { data, error } = await supabase
      .from(params.table)
      .select(params.select || '*')
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error executing query:', error)
    throw error
  }
}

export { connect, query, supabase }