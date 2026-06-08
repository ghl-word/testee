// tests/patientService.test.js
const { cadastrarPaciente, db } = require('./patientService');

describe('Testes Unitários - Cadastro de Pacientes', () => {
    
    // Antes de cada teste, limpamos o banco simulado
    beforeEach(() => {
        db.length = 0; 
    });

    // Teste 01 – Cadastro válido (Positivo)
    test('Deve cadastrar um paciente com sucesso (Teste 01)', () => {
        // Entrada
        const paciente = {
            nome: 'João da Silva',
            cpf: '123.456.789-00',
            dataNascimento: '1990-01-01'
        };

        // Ação
        const resultado = cadastrarPaciente(paciente);
        
        // Resultado esperado
        expect(resultado).toHaveProperty('id');
        expect(resultado.nome).toBe('João da Silva');
        expect(db).toHaveLength(1); // Garante que foi salvo no banco
    });

    // Teste 02 – CPF duplicado (Negativo)
    test('Deve impedir o cadastro com CPF já existente (Teste 02)', () => {
        // Entrada
        const paciente = {
            nome: 'Maria Souza',
            cpf: '987.654.321-11',
            dataNascimento: '1985-05-05'
        };

        // Ação 1: Cadastra a primeira vez com sucesso
        cadastrarPaciente(paciente);

        // Ação 2: Tenta cadastrar de novo com o mesmo CPF
        // Resultado esperado: Deve lançar um erro
        expect(() => {
            cadastrarPaciente(paciente);
        }).toThrow('CPF já existente no sistema.');
    });
});