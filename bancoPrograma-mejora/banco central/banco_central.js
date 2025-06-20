// banco_central.js

class RegistroCBU {
  constructor(cbu, alias, banco, numeroCuenta, titular) {
    this.cbu = cbu;
    this.alias = alias;
    this.banco = banco; // nombre del banco
    this.numeroCuenta = numeroCuenta;
    this.titular = titular; // { nombre, email }
  }
}

class BancoCentral {
  constructor() {
    this.registros = [];
    this.transferencias = [];
    this.cargarDesdeStorage();
  }

  registrarCuenta(cbu, alias, banco, numeroCuenta, titular) {
    if (this.registros.find(r => r.cbu === cbu || r.alias === alias)) {
      throw new Error("CBU o alias ya registrados");
    }

    const nuevoRegistro = new RegistroCBU(cbu, alias, banco, numeroCuenta, titular);
    this.registros.push(nuevoRegistro);
    this.guardarEnStorage();
  }

  buscarDestino(cbuOalias) {
    return this.registros.find(r => r.cbu === cbuOalias || r.alias === cbuOalias);
  }

  transferirEntreBancos(origenBanco, cuentaOrigen, destinoCBUoAlias, monto, descripcion) {
    const destino = this.buscarDestino(destinoCBUoAlias);
    if (!destino) throw new Error("Destino no encontrado en el sistema");

    const transferencia = {
      fecha: new Date(),
      origenBanco,
      cuentaOrigen,
      destinoBanco: destino.banco,
      cuentaDestino: destino.numeroCuenta,
      titularDestino: destino.titular.nombre,
      cbuDestino: destino.cbu,
      monto,
      descripcion
    };

    this.transferencias.push(transferencia);
    this.guardarEnStorage();

    // Debería comunicarse con ambos bancos para reflejar la transferencia
    // Esto se hará en integración con sus respectivos scripts

    return transferencia;
  }

  guardarEnStorage() {
    localStorage.setItem("bancoCentralRegistros", JSON.stringify(this.registros));
    localStorage.setItem("bancoCentralTransferencias", JSON.stringify(this.transferencias));
  }

  cargarDesdeStorage() {
    const registros = JSON.parse(localStorage.getItem("bancoCentralRegistros")) || [];
    const transferencias = JSON.parse(localStorage.getItem("bancoCentralTransferencias")) || [];
    this.registros = registros.map(r => new RegistroCBU(r.cbu, r.alias, r.banco, r.numeroCuenta, r.titular));
    this.transferencias = transferencias.map(t => ({ ...t, fecha: new Date(t.fecha) }));
  }
}
