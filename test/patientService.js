// tests/patientService.js
// Banco de dados simulado em memória para o teste unitário
const db = []; 

function cadastrarPaciente(paciente) {
    if (!paciente.nome || !paciente.cpf || !paciente.dataNascimento) {
        throw new Error('Campos obrigatórios não podem estar vazios.');
    }

    const dataNasc = new Date(paciente.dataNascimento);
    if (dataNasc > new Date()) {
        throw new Error('A data de nascimento não pode ser futura.');
    }

    const cpfExiste = db.find(p => p.cpf === paciente.cpf);
    if (cpfExiste) {
        throw new Error('CPF já existente no sistema.');
    }

    const novoPaciente = { id: Date.now(), ...paciente };
    db.push(novoPaciente);
    return novoPaciente;
}

// Exportamos a função e o banco simulado para o teste
module.exports = { cadastrarPaciente, db };