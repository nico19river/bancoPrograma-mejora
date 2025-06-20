class Usuario {
    constructor(nombre, email, telefono, direccion) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.direccion = direccion;
    }
}

class Banco {
    constructor(nombre) {
        this.nombre = nombre;
        this.cuentas = [];
        this.transferencias = [];
    }

    agregarCuenta(cuenta) {
        this.cuentas.push(cuenta);
    }

    realizarTransferencia(origen, destino, cantidad, descripcion) {
        const cuentaDestinoReal = this.cuentas.find(c => c.numero === destino.numero);
        
        if (!cuentaDestinoReal) {
            throw new Error("La cuenta destino no existe");
        }
        
        if (origen.saldo >= cantidad) {
            origen.saldo -= cantidad;
            cuentaDestinoReal.saldo += cantidad;
            
            const esInterna = origen.usuario.email === cuentaDestinoReal.usuario.email;
            
            const transferencia = new Transferencia(
                new Date(),
                origen.numero,
                destino.numero,
                cantidad,
                descripcion,
                origen.usuario.email,
                cuentaDestinoReal.usuario.email,
                esInterna
            );
            
            this.transferencias.push(transferencia);
            return transferencia;
        } else {
            throw new Error("Fondos insuficientes");
        }
    }
}

class Cuenta {
    constructor(numero, tipo, saldo = 0, usuario) {
        this.numero = numero;
        this.tipo = tipo;
        this.saldo = saldo;
        this.usuario = usuario;
    }
}

class Transferencia {
    constructor(fecha, origen, destino, cantidad, descripcion = "", usuarioOrigen = "", usuarioDestino = "") {
        this.fecha = fecha;
        this.origen = origen;
        this.destino = destino;
        this.cantidad = cantidad;
        this.descripcion = descripcion;
        this.usuarioOrigen = usuarioOrigen;
        this.usuarioDestino = usuarioDestino;
    }
}

// Función para guardar datos en localStorage
function saveDataToLocalStorage() {
    localStorage.setItem('bancoData', JSON.stringify({
        cuentas: miBanco.cuentas,
        transferencias: miBanco.transferencias,
        usuario: usuarioActual
    }));
}

function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('bancoData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        usuarioActual.nombre = data.usuario.nombre;
        usuarioActual.email = data.usuario.email;
        usuarioActual.telefono = data.usuario.telefono;
        usuarioActual.direccion = data.usuario.direccion;
        
        miBanco.cuentas = data.cuentas.map(cuentaData => {
            const usuario = new Usuario(
                cuentaData.usuario?.nombre || usuarioActual.nombre,
                cuentaData.usuario?.email || usuarioActual.email,
                cuentaData.usuario?.telefono || usuarioActual.telefono,
                cuentaData.usuario?.direccion || usuarioActual.direccion
            );
            return new Cuenta(
                cuentaData.numero,
                cuentaData.tipo,
                cuentaData.saldo,
                usuario
            );
        });
        
        miBanco.transferencias = data.transferencias.map(transferData => {
            return new Transferencia(
                new Date(transferData.fecha),
                transferData.origen,
                transferData.destino,
                transferData.cantidad,
                transferData.descripcion,
                transferData.usuarioOrigen,
                transferData.usuarioDestino
            );
        });
    }
}


const miBanco = new Banco("Banco Digital");

// Datos de ejemplo
const usuarioActual = new Usuario(
    "Fernando Gago",
    "lineaDeCinco@exBoca.com",
    "555-4411",
    "Brandsen 805"
);

const usuarioEjemplo = new Usuario(
    "Juan Pérez",
    "juan.perez@example.com",
    "555-1234",
    "Calle Falsa 123"
);

const cuenta1 = new Cuenta("123456789", "checking", 1500, usuarioActual);
const cuenta2 = new Cuenta("987654321", "savings", 5000, usuarioActual);
const cuentaEjemplo = new Cuenta("9122018", "herencia", 30000, usuarioEjemplo);

miBanco.agregarCuenta(cuenta1);
miBanco.agregarCuenta(cuenta2);
miBanco.agregarCuenta(cuentaEjemplo);

miBanco.realizarTransferencia(cuenta1, cuenta2, 200, "Ahorro mensual");
miBanco.realizarTransferencia(cuenta2, cuenta1, 2000, "Comida sin Gluten");
miBanco.realizarTransferencia(cuentaEjemplo, cuenta1, 31, "Herencia");
miBanco.realizarTransferencia(cuentaEjemplo, cuenta2, 3100, "Hijos nuestros");

// DOM Elements
const sections = {
    accounts: document.getElementById('accounts-section'),
    transfer: document.getElementById('transfer-section'),
    profile: document.getElementById('profile-section')
};

const menuButtons = document.querySelectorAll('.menu-btn');
const usernameDisplay = document.getElementById('username-display');
const logoutBtn = document.getElementById('logout-btn');
const accountsList = document.getElementById('accounts-list');
const newAccountBtn = document.getElementById('new-account-btn');
const newAccountModal = document.getElementById('new-account-modal');
const newAccountForm = document.getElementById('new-account-form');
const closeModals = document.querySelectorAll('.close-modal');
const fromAccountSelect = document.getElementById('from-account');
const transferForm = document.getElementById('transfer-form');
const transfersList = document.getElementById('transfers-list');
const profileSection = document.getElementById('profile-section');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');

// Mostrar información del usuario
function displayUserInfo() {
    usernameDisplay.textContent = usuarioActual.nombre;
    
    document.getElementById('profile-name').textContent = usuarioActual.nombre;
    document.getElementById('profile-email').textContent = usuarioActual.email;
    document.getElementById('profile-phone').textContent = usuarioActual.telefono;
    document.getElementById('profile-address').textContent = usuarioActual.direccion;
    
    // Rellenar formulario de edición
    document.getElementById('edit-name').value = usuarioActual.nombre;
    document.getElementById('edit-email').value = usuarioActual.email;
    document.getElementById('edit-phone').value = usuarioActual.telefono || '';
    document.getElementById('edit-address').value = usuarioActual.direccion || '';
}

// Mostrar cuentas
function displayAccounts() {
    accountsList.innerHTML = '';    
    
    const userAccounts = miBanco.cuentas.filter(
        cuenta => cuenta.usuario.email === usuarioActual.email
    );

    if (userAccounts.length === 0) {
        accountsList.innerHTML = '<p class="no-accounts">No tienes cuentas activas</p>';
        return;
    }
    
    userAccounts.forEach(cuenta => {
        const accountCard = document.createElement('div');
        accountCard.className = 'account-card';
        accountCard.id = `account-${cuenta.numero}`;
        
        const typeText = cuenta.tipo === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
        const typeClass = cuenta.tipo === 'checking' ? 'checking-account' : 'savings-account';
        
        accountCard.innerHTML = `
            <div class="account-header ${typeClass}">
                <h3>${typeText}</h3>
                <div class="account-number">Nº ${cuenta.numero}</div>
            </div>
            <div class="account-body">
                <div class="balance">$${cuenta.saldo.toFixed(2)}</div>
                <div class="account-actions">
                    <button class="account-action-btn deposit-btn" data-account="${cuenta.numero}">
                        <i class="fas fa-coins"></i> Depositar
                    </button>
                    <button class="account-action-btn withdraw-btn" data-account="${cuenta.numero}">
                        <i class="fas fa-money-bill-wave"></i> Retirar
                    </button>
                    <button class="account-action-btn delete-account-btn" data-account="${cuenta.numero}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                <div class="action-form" id="deposit-form-${cuenta.numero}">
                    <input type="number" class="amount-input" placeholder="Cantidad a depositar" min="0.01" step="0.01">
                    <div class="action-form-actions">
                        <button class="action-form-btn confirm-btn confirm-deposit-btn" data-account="${cuenta.numero}">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                        <button class="action-form-btn cancel-btn cancel-deposit-btn" data-account="${cuenta.numero}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
                <div class="action-form" id="withdraw-form-${cuenta.numero}">
                    <input type="number" class="amount-input" placeholder="Cantidad a retirar" min="0.01" step="0.01">
                    <div class="action-form-actions">
                        <button class="action-form-btn confirm-btn confirm-withdraw-btn" data-account="${cuenta.numero}">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                        <button class="action-form-btn cancel-btn cancel-withdraw-btn" data-account="${cuenta.numero}">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;        
        accountsList.appendChild(accountCard);
    });
    setupAccountButtons();
}

// Función para eliminar una cuenta
function deleteAccount(accountNumber) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
        const cuenta = miBanco.cuentas.find(c => c.numero === accountNumber);
        
        if (cuenta.saldo > 0) {
            alert('No puedes eliminar una cuenta con saldo. Por favor, transfiere el dinero primero.');
            return;
        }
        
        miBanco.cuentas = miBanco.cuentas.filter(c => c.numero !== accountNumber);

        saveDataToLocalStorage();
        displayAccounts();
        populateAccountSelects();
    }
}

function setupAccountButtons() {
    // Botones de depósito
    document.querySelectorAll('.deposit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            hideAllForms();
            document.getElementById(`deposit-form-${accountNumber}`).style.display = 'flex';
            e.target.style.display = 'none';
        });
    });

    // Botones de retiro
    document.querySelectorAll('.withdraw-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            hideAllForms();
            document.getElementById(`withdraw-form-${accountNumber}`).style.display = 'flex';
            e.target.style.display = 'none';
        });
    });

    // Confirmar depósito
    document.querySelectorAll('.confirm-deposit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            const amountInput = document.querySelector(`#deposit-form-${accountNumber} .amount-input`);
            const amount = parseFloat(amountInput.value);
            
            if (isNaN(amount) || amount <= 0) {
                alert('Por favor ingrese una cantidad válida mayor que cero');
                return;
            }
            
            const cuenta = miBanco.cuentas.find(c => c.numero === accountNumber);
            cuenta.saldo += amount;
            
            updateAccountDisplay(cuenta);
            saveDataToLocalStorage();
            resetForms(accountNumber);
        });
    });

    // Confirmar retiro
    document.querySelectorAll('.confirm-withdraw-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            const amountInput = document.querySelector(`#withdraw-form-${accountNumber} .amount-input`);
            const amount = parseFloat(amountInput.value);
            const cuenta = miBanco.cuentas.find(c => c.numero === accountNumber);
            
            if (isNaN(amount) || amount <= 0) {
                alert('Por favor ingrese una cantidad válida mayor que cero');
                return;
            }
            
            if (cuenta.saldo < amount) {
                alert('Fondos insuficientes para realizar este retiro');
                return;
            }
            
            cuenta.saldo -= amount;
            
            updateAccountDisplay(cuenta);
            saveDataToLocalStorage();
            resetForms(accountNumber);
        });
    });

    // Cancelar depósito/retiro
    document.querySelectorAll('.cancel-deposit-btn, .cancel-withdraw-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            resetForms(accountNumber);
        });
    });

    // Botones de eliminar
    document.querySelectorAll('.delete-account-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const accountNumber = e.target.getAttribute('data-account');
            deleteAccount(accountNumber);
        });
    });
}

function hideAllForms() {
    document.querySelectorAll('.action-form').forEach(form => {
        form.style.display = 'none';
    });
    
    document.querySelectorAll('.account-action-btn').forEach(btn => {
        btn.style.display = 'flex';
    });
}

function resetForms(accountNumber) {
    hideAllForms();
    document.querySelectorAll(`#deposit-form-${accountNumber} .amount-input, #withdraw-form-${accountNumber} .amount-input`).forEach(input => {
        input.value = '';
    });
}

function updateAccountDisplay(cuenta) {
    const accountCard = document.getElementById(`account-${cuenta.numero}`);
    if (accountCard) {
        const typeText = cuenta.tipo === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
        
        accountCard.querySelector('h3').textContent = typeText;
        accountCard.querySelector('.balance').textContent = `$${cuenta.saldo.toFixed(2)}`;
        accountCard.querySelector('.account-number').textContent = `Nº ${cuenta.numero}`;
    }
}

// Rellenar selector de cuentas para transferencias
function populateAccountSelects() {
    fromAccountSelect.innerHTML = '';

    const userAccounts = miBanco.cuentas.filter(
        cuenta => cuenta.usuario.email === usuarioActual.email
    );
    
    userAccounts.forEach(cuenta => {
        const option = document.createElement('option');
        option.value = cuenta.numero;
        
        const typeText = cuenta.tipo === 'checking' ? 'Cuenta Corriente' : 'Cuenta de Ahorros';
        option.textContent = `${typeText} (${cuenta.numero}) - $${cuenta.saldo.toFixed(2)}`;
        
        fromAccountSelect.appendChild(option);
    });
}

// Mostrar historial de transferencias
function displayTransfers() {
    transfersList.innerHTML = '';
    
    // Obtener números de cuentas del usuario actual
    const userAccountNumbers = miBanco.cuentas
        .filter(cuenta => cuenta.usuario.email === usuarioActual.email)
        .map(cuenta => cuenta.numero);
    
    // Filtrar transferencias relacionadas con las cuentas del usuario
    const userTransfers = miBanco.transferencias.filter(transfer => {
        return userAccountNumbers.includes(transfer.origen) || 
               userAccountNumbers.includes(transfer.destino);
    });
    
    if (userTransfers.length === 0) {
        transfersList.innerHTML = '<tr><td colspan="5">No hay transferencias registradas</td></tr>';
        return;
    }
    
    userTransfers.forEach(transfer => {
        const row = document.createElement('tr');
        
        const fecha = new Date(transfer.fecha).toLocaleString();
        const origen = miBanco.cuentas.find(c => c.numero === transfer.origen) || 
                      { numero: transfer.origen, tipo: 'Externa' };
        const destino = miBanco.cuentas.find(c => c.numero === transfer.destino) || 
                       { numero: transfer.destino, tipo: 'Externa' };        
        const typeOrigen = origen.tipo === 'checking' ? 'CC' : 'CA';
        const typeDestino = destino.tipo === 'checking' ? 'CC' : 'CA';
        
        // Determinar el tipo de transferencia
        const isInternal = userAccountNumbers.includes(transfer.origen) && 
                          userAccountNumbers.includes(transfer.destino);
        const isOutgoing = userAccountNumbers.includes(transfer.origen) && !isInternal;
        
        let directionClass = '';
        if (isInternal) {
            directionClass = 'internal';
        } else if (isOutgoing) {
            directionClass = 'outgoing';
        } else {
            directionClass = 'incoming';
        }
        
        row.innerHTML = `
            <td>${fecha}</td>
            <td class="${directionClass}">${typeOrigen} ${origen.numero}</td>
            <td class="${directionClass}">${typeDestino} ${destino.numero}</td>
            <td class="amount ${directionClass}">${isInternal ? '' : (isOutgoing ? '-' : '+')}$${transfer.cantidad.toFixed(2)}</td>
            <td>${transfer.descripcion} ${isInternal ? '<span class="internal-tag">(Entre mis cuentas)</span>' : ''}</td>
        `;
        
        transfersList.appendChild(row);
    });
}

function generateAccountNumber() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}

// Event Listeners
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        
        menuButtons.forEach(btn => btn.classList.remove('active'));
        Object.values(sections).forEach(section => section.classList.remove('active'));
        
        // Agregar clase active al botón clickeado y su sección correspondiente
        button.classList.add('active');
        const sectionId = button.getAttribute('data-section');
        sections[sectionId].classList.add('active');
    });
});

logoutBtn.addEventListener('click', () => {
    alert('Sesión cerrada, chau Gago. WIP.');
    // WIP login
});

newAccountBtn.addEventListener('click', () => {
    newAccountModal.style.display = 'block';
});

closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

newAccountForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const accountType = document.getElementById('account-type').value;
    const accountNumber = generateAccountNumber();
    
    const nuevaCuenta = new Cuenta(
        accountNumber,
        accountType,
        0,
        usuarioActual
    );
    
    miBanco.agregarCuenta(nuevaCuenta);
    
    displayAccounts();
    saveDataToLocalStorage();
    populateAccountSelects();
    newAccountModal.style.display = 'none';
    newAccountForm.reset();
});

transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fromAccountNum = fromAccountSelect.value;
    const toAccountNum = document.getElementById('to-account').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    
    const fromAccount = miBanco.cuentas.find(c => c.numero === fromAccountNum);
    
    try {
        // Buscar la cuenta destino en las cuentas del banco
        const toAccount = miBanco.cuentas.find(c => c.numero === toAccountNum);
        
        if (!toAccount) {
            throw new Error("La cuenta destino no existe en nuestro banco");
        }
        
        if (fromAccountNum === toAccountNum) {
            throw new Error("No puedes transferir a la misma cuenta");
        }
        
        const transferencia = miBanco.realizarTransferencia(
            fromAccount,
            toAccount,
            amount,
            description
        );
        
        if (transferencia) {
            alert('Transferencia realizada con éxito');
            displayAccounts();
            populateAccountSelects();
            displayTransfers();
            transferForm.reset();
            saveDataToLocalStorage();
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

editProfileBtn.addEventListener('click', () => {
    editProfileModal.style.display = 'block';
});

editProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    usuarioActual.nombre = document.getElementById('edit-name').value;
    usuarioActual.email = document.getElementById('edit-email').value;
    usuarioActual.telefono = document.getElementById('edit-phone').value;
    usuarioActual.direccion = document.getElementById('edit-address').value;
    
    saveDataToLocalStorage();
    displayUserInfo();
    editProfileModal.style.display = 'none';
});

// Inicialización
loadDataFromLocalStorage();
displayUserInfo();
displayAccounts();
populateAccountSelects();
displayTransfers();

class BancoDigitalMejorado extends Banco {
  constructor(nombre) {
    super(nombre);
    this.bancoCentral = new BancoCentral();
    this.configurarEventosInterbancarios();
  }

  configurarEventosInterbancarios() {
    // Escuchar transferencias interbancarias entrantes
    window.addEventListener('transferenciaInterbancaria', (event) => {
      const transferencia = event.detail;
      if (transferencia.destinoBanco === this.nombre) {
        this.procesarTransferenciaEntrante(transferencia);
      }
    });
  }

  procesarTransferenciaEntrante(transferencia) {
    // Buscar la cuenta destino
    const cuentaDestino = this.cuentas.find(c => c.numero === transferencia.cuentaDestino);
    if (cuentaDestino) {
      // Agregar fondos a la cuenta destino
      cuentaDestino.saldo += transferencia.monto;
      
      // Registrar la transferencia en el historial local
      const transferenciaLocal = new Transferencia(
        transferencia.fecha,
        `${transferencia.origenBanco}-${transferencia.cuentaOrigen}`,
        transferencia.cuentaDestino,
        transferencia.monto,
        `${transferencia.descripcion} (desde ${transferencia.origenBanco})`,
        transferencia.titularOrigen,
        transferencia.titularDestino
      );
      
      this.transferencias.push(transferenciaLocal);
      
      // Guardar cambios
      saveDataToLocalStorage();
      
      // Actualizar interfaz si está visible
      if (typeof displayAccounts === 'function') displayAccounts();
      if (typeof displayTransfers === 'function') displayTransfers();
      
      console.log(`Transferencia recibida: $${transferencia.monto} de ${transferencia.origenBanco}`);
    }
  }

  realizarTransferenciaInterbancaria(cuentaOrigen, destinoCBUoAlias, monto, descripcion) {
    // Verificar que la cuenta origen pertenezca a este banco
    const cuenta = this.cuentas.find(c => c.numero === cuentaOrigen);
    if (!cuenta) {
      throw new Error("Cuenta origen no encontrada");
    }

    if (cuenta.saldo < monto) {
      throw new Error("Fondos insuficientes");
    }

    // Verificar el destino en el banco central
    const infoDestino = this.bancoCentral.obtenerInfoCuenta(destinoCBUoAlias);
    if (!infoDestino) {
      throw new Error("Destino no encontrado en el sistema interbancario");
    }

    try {
      // Procesar la transferencia a través del banco central
      const transferencia = this.bancoCentral.procesarTransferenciaInterbancaria(
        this.nombre,
        cuenta.numero,
        cuenta.usuario.nombre,
        destinoCBUoAlias,
        monto,
        descripcion
      );

      // Descontar fondos de la cuenta origen
      cuenta.saldo -= monto;

      // Registrar la transferencia localmente
      const transferenciaLocal = new Transferencia(
        transferencia.fecha,
        cuenta.numero,
        `${transferencia.destinoBanco}-${transferencia.cuentaDestino}`,
        monto,
        `${descripcion} (hacia ${transferencia.destinoBanco})`,
        transferencia.titularOrigen,
        transferencia.titularDestino
      );

      this.transferencias.push(transferenciaLocal);
      
      return transferencia;

    } catch (error) {
      throw new Error(`Error en transferencia interbancaria: ${error.message}`);
    }
  }
}