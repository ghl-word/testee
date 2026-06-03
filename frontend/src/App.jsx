import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const emptyForm = {
  patient: '',
  doctor: '',
  specialty: '',
  date: '',
  time: '',
  status: 'Aguardando'
};

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para a IA
  const [iaQuestion, setIaQuestion] = useState('');
  const [iaResponse, setIaResponse] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaModo, setIaModo] = useState('resumido');
  const [iaTipoPrompt, setIaTipoPrompt] = useState('simples');

  async function loadAppointments() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/appointments`);
      if (!response.ok) {
        throw new Error('Não foi possível buscar os agendamentos.');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(item => item.status === 'Confirmada').length;
    const waiting = appointments.filter(item => item.status === 'Aguardando').length;

    return { total, confirmed, waiting };
  }, [appointments]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cadastrar consulta.');
      }

      setSuccess('Consulta cadastrada com sucesso.');
      setForm(emptyForm);
      loadAppointments();
    } catch (err) {
      setError(err.message);
    }
  }

  // Função que envia a pergunta para a IA
  async function handleAskIA(event) {
    event.preventDefault();
    if (!iaQuestion) return;

    setIaLoading(true);
    setIaResponse('');

    try {
      const response = await fetch(`${API_URL}/api/ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        pergunta: iaQuestion, 
        modo: iaModo, 
        tipoPrompt: iaTipoPrompt 
        })
      });

      const data = await response.json();

      if (data.sucesso) {
        setIaResponse(data.resposta);
      } else {
        setIaResponse(data.erro);
      }
    } catch (err) {
      setIaResponse('Erro ao conectar com o servidor.');
    } finally {
      setIaLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">Sistema de agendamento médico</p>
          <h1>MedAgenda</h1>
          <p className="subtitle">
            Painel simples para visualizar e cadastrar consultas médicas.
          </p>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard title="Total de consultas" value={stats.total} />
        <StatCard title="Confirmadas" value={stats.confirmed} />
        <StatCard title="Aguardando" value={stats.waiting} />
      </section>

      <main className="content-grid">
        <div>
          <section className="card">
            <h2>Nova consulta</h2>
            <form className="form-grid" onSubmit={handleSubmit}>
              <input name="patient" placeholder="Paciente" value={form.patient} onChange={handleChange} />
              <input name="doctor" placeholder="Médico" value={form.doctor} onChange={handleChange} />
              <input name="specialty" placeholder="Especialidade" value={form.specialty} onChange={handleChange} />
              <input name="date" type="date" value={form.date} onChange={handleChange} />
              <input name="time" type="time" value={form.time} onChange={handleChange} />
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Aguardando</option>
                <option>Confirmada</option>
                <option>Remarcada</option>
              </select>
              <button type="submit">Cadastrar consulta</button>
            </form>

            {success && <p className="message success">{success}</p>}
            {error && <p className="message error">{error}</p>}
          </section>

          {/* NOVA SEÇÃO DA IA */}
          <select value={iaModo} onChange={e => setIaModo(e.target.value)}>
            <option value="tecnico">Modo Técnico</option>
            <option value="resumido">Modo Resumido</option>
            <option value="professor">Modo Professor</option>
            <option value="detalhado">Modo Detalhado</option>
            <option value="suporte_tecnico">Suporte Técnico de TI</option>
          </select>

          <select value={iaTipoPrompt} onChange={e => setIaTipoPrompt(e.target.value)}>
            <option value="simples">Prompt Simples</option>
            <option value="estruturado">Prompt Estruturado</option>
            <option value="especializado">Prompt Especializado</option>
          </select>
          <section className="card" style={{ marginTop: '20px' }}>
            <h2>Assistente MedAgenda (IA)</h2>
            <form className="form-grid" onSubmit={handleAskIA}>
              <input 
                placeholder="Faça uma pergunta ou peça um resumo..." 
                value={iaQuestion} 
                onChange={e => setIaQuestion(e.target.value)} 
              />
              <button type="submit" disabled={iaLoading} style={{ background: '#0f766e' }}>
                {iaLoading ? 'Pensando...' : 'Perguntar à IA'}
              </button>
            </form>
            
            {iaResponse && (
              <div className="message" style={{ background: '#f8fafc', color: '#0f172a', marginTop: '15px', border: '1px solid #cbd5e1' }}>
                <strong>Resposta:</strong>
                <p style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{iaResponse}</p>
              </div>
            )}
          </section>
        </div>

        <section className="card">
          <div className="table-header">
            <h2>Consultas do dia</h2>
            <button onClick={loadAppointments}>Atualizar</button>
          </div>

          {loading ? (
            <p>Carregando dados...</p>
          ) : appointments.length === 0 ? (
            <p>Nenhuma consulta cadastrada.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Especialidade</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(item => (
                    <tr key={item.id}>
                      <td>{item.patient}</td>
                      <td>{item.doctor}</td>
                      <td>{item.specialty}</td>
                      <td>{item.date}</td>
                      <td>{item.time}</td>
                      <td>
                        <span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <article className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}