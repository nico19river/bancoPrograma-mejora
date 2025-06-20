// banco_provincial.js

class Usuario {
  constructor(nombre, email, telefono, direccion) {
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.direccion = direccion;
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
    const cuentaDestino = this.cuentas.find(c => c.numero === destino.numero);
    if (!cuentaDestino) throw new Error("La cuenta destino no existe");
    if (origen.saldo < cantidad) throw new Error("Fondos insuficientes");

    origen.saldo -= cantidad;
    cuentaDestino.saldo += cantidad;

    const transferencia = new Transferencia(
      new Date(),
      origen.numero,
      destino.numero,
      cantidad,
      descripcion,
      origen.usuario.email,
      cuentaDestino.usuario.email
    );

    this.transferencias.push(transferencia);
    return transferencia;
  }

  guardarEnLocalStorage() {
    localStorage.setItem(`banco_${this.nombre}`, JSON.stringify({
      cuentas: this.cuentas,
      transferencias: this.transferencias
    }));
  }

  cargarDesdeLocalStorage() {
    const data = localStorage.getItem(`banco_${this.nombre}`);
    if (data) {
      const parsed = JSON.parse(data);
      this.cuentas = parsed.cuentas.map(c => new Cuenta(
        c.numero,
        c.tipo,
        c.saldo,
        new Usuario(c.usuario.nombre, c.usuario.email, c.usuario.telefono, c.usuario.direccion)
      ));
      this.transferencias = parsed.transferencias.map(t => new Transferencia(
        new Date(t.fecha),
        t.origen,
        t.destino,
        t.cantidad,
        t.descripcion,
        t.usuarioOrigen,
        t.usuarioDestino
      ));
    }
  }

  procesarTransferenciasEntrantesDesdeCentral(bancoCentral) {
    const recibidas = bancoCentral.transferencias.filter(t => t.destinoBanco === this.nombre);
    const yaRegistradas = this.transferencias.map(t => `${t.origen}-${t.destino}-${t.fecha}`);

    recibidas.forEach(t => {
      const key = `${t.origenBanco}-${t.cuentaOrigen}-${t.fecha}`;
      if (!yaRegistradas.includes(key)) {
        const cuentaDestino = this.cuentas.find(c => c.numero === t.cuentaDestino);
        if (cuentaDestino) {
          cuentaDestino.saldo += t.monto;
          this.transferencias.push(new Transferencia(
            new Date(t.fecha),
            t.cuentaOrigen,
            cuentaDestino.numero,
            t.monto,
            t.descripcion,
            t.titularDestino,
            cuentaDestino.usuario.email
          ));
        }
      }
    });
  }
}

// Inicialización
const usuarioActual = new Usuario("Juan Domingo", "juan.domingo@provincial.com", "555-8989", "La Plata 1945");
const bancoProvincial = new Banco("Provincia");
bancoProvincial.cargarDesdeLocalStorage();

const bancoCentral = new BancoCentral();
bancoProvincial.procesarTransferenciasEntrantesDesdeCentral(bancoCentral);
bancoProvincial.guardarEnLocalStorage();

// Navegación entre secciones
const menuButtons = document.querySelectorAll(".menu-btn");
const contentSections = document.querySelectorAll(".content-section");

menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-section");

    menuButtons.forEach(btn => btn.classList.remove("active"));
    contentSections.forEach(section => section.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(`${target}-section`).classList.add("active");
  });
});
