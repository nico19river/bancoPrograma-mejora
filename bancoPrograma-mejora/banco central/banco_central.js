// banco_central.js - Versión mejorada

class RegistroCBU {
  constructor(cbu, alias, banco, numeroCuenta, titular) {
    this.cbu = cbu;
    this.alias = alias;
    this.banco = banco; // nombre del banco
    this.numeroCuenta = numeroCuenta;
    this.titular = titular; // { nombre, email }
  }
}

class TransferenciaInterbancaria {
  constructor(fecha, origenBanco, cuentaOrigen, destinoBanco, cuentaDestino, monto, descripcion, cbuDestino, titularOrigen, titularDestino) {
    this.id = Date.now() + Math.random(); // ID único
    this.fecha = fecha;
    this.origenBanco = origenBanco;
    this.cuentaOrigen = cuentaOrigen;
    this.destinoBanco = destinoBanco;
    this.cuentaDestino = cuentaDestino;
    this.monto = monto;
    this.descripcion = descripcion;
    this.cbuDestino = cbuDestino;
    this.titularOrigen = titularOrigen;
    this.titularDestino = titularDestino;
    this.estado = 'procesada'; // procesada, pendiente, error
  }
}

class BancoCentral {
  constructor() {
    this.registros = [];
    this.transferenciasInterbancarias = [];
    this.cargarDesdeStorage();
    this.inicializarDatosDePrueba();
  }

  inicializarDatosDePrueba() {
    // Solo agregar datos si no existen
    if (this.registros.length === 0) {
      // Registros del Banco Digital
      this.registrarCuenta(
        "0170123456789012345678", 
        "fernando.gago", 
        "Banco Digital", 
        "123456789", 
        { nombre: "Fernando Gago", email: "lineaDeCinco@exBoca.com" }
      );
      
      this.registrarCuenta(
        "0170987654321098765432", 
        "fernando.ahorro", 
        "Banco Digital", 
        "987654321", 
        { nombre: "Fernando Gago", email: "lineaDeCinco@exBoca.com" }
      );

      // Registros del Banco Provincial
      this.registrarCuenta(
        "0140555666777888999000", 
        "juan.domingo", 
        "Provincia", 
        "555666777", 
        { nombre: "Juan Domingo", email: "juan.domingo@provincial.com" }
      );
      
      this.registrarCuenta(
        "0140111222333444555666", 
        "jd.ahorro", 
        "Provincia", 
        "111222333", 
        { nombre: "Juan Domingo", email: "juan.domingo@provincial.com" }
      );

      // Cuenta externa de ejemplo
      this.registrarCuenta(
        "0720999888777666555444", 
        "santander.ejemplo", 
        "Santander", 
        "888999000", 
        { nombre: "María González", email: "maria@santander.com" }
      );
    }
  }

  registrarCuenta(cbu, alias, banco, numeroCuenta, titular) {
    if (this.registros.find(r => r.cbu === cbu || r.alias === alias)) {
      console.warn("CBU o alias ya registrados");
      return;
    }

    const nuevoRegistro = new RegistroCBU(cbu, alias, banco, numeroCuenta, titular);
    this.registros.push(nuevoRegistro);
    this.guardarEnStorage();
    return nuevoRegistro;
  }

  buscarDestino(cbuOalias) {
    return this.registros.find(r => r.cbu === cbuOalias || r.alias === cbuOalias);
  }

  // Método principal para transferencias entre bancos
  procesarTransferenciaInterbancaria(origenBanco, cuentaOrigen, titularOrigen, destinoCBUoAlias, monto, descripcion) {
    const destino = this.buscarDestino(destinoCBUoAlias);
    if (!destino) {
      throw new Error("Destino no encontrado en el sistema interbancario");
    }

    // No permitir transferencias dentro del mismo banco
    if (origenBanco === destino.banco) {
      throw new Error("Use transferencias internas para cuentas del mismo banco");
    }

    const transferencia = new TransferenciaInterbancaria(
      new Date(),
      origenBanco,
      cuentaOrigen,
      destino.banco,
      destino.numeroCuenta,
      monto,
      descripcion,
      destino.cbu,
      titularOrigen,
      destino.titular.nombre
    );

    this.transferenciasInterbancarias.push(transferencia);
    this.guardarEnStorage();

    // Notificar a los bancos involucrados
    this.notificarBancos(transferencia);

    return transferencia;
  }

  // Simula la notificación a los bancos
  notificarBancos(transferencia) {
    // En un sistema real, esto sería una comunicación asíncrona
    console.log(`Notificando transferencia: ${transferencia.origenBanco} -> ${transferencia.destinoBanco}`);
    
    // Disparar eventos personalizados para que los bancos procesen las transferencias
    window.dispatchEvent(new CustomEvent('transferenciaInterbancaria', {
      detail: transferencia
    }));
  }

  // Obtener transferencias por banco
  obtenerTransferenciasPorBanco(nombreBanco) {
    return this.transferenciasInterbancarias.filter(t => 
      t.origenBanco === nombreBanco || t.destinoBanco === nombreBanco
    );
  }

  // Obtener todas las transferencias salientes de un banco
  obtenerTransferenciasSalientes(nombreBanco) {
    return this.transferenciasInterbancarias.filter(t => t.origenBanco === nombreBanco);
  }

  // Obtener todas las transferencias entrantes a un banco
  obtenerTransferenciasEntrantes(nombreBanco) {
    return this.transferenciasInterbancarias.filter(t => t.destinoBanco === nombreBanco);
  }

  guardarEnStorage() {
    try {
      const data = {
        registros: this.registros,
        transferencias: this.transferenciasInterbancarias
      };
      const dataString = JSON.stringify(data);
      console.log("Guardando en localStorage:", dataString);
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
    }
  }

  cargarDesdeStorage() {
    try {
      const registrosData = JSON.parse("[]") || [];
      const transferenciasData = JSON.parse("[]") || [];
      
      this.registros = registrosData.map(r => new RegistroCBU(r.cbu, r.alias, r.banco, r.numeroCuenta, r.titular));
      this.transferenciasInterbancarias = transferenciasData.map(t => 
        new TransferenciaInterbancaria(
          new Date(t.fecha), t.origenBanco, t.cuentaOrigen, t.destinoBanco, 
          t.cuentaDestino, t.monto, t.descripcion, t.cbuDestino, t.titularOrigen, t.titularDestino
        )
      );
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error);
      this.registros = [];
      this.transferenciasInterbancarias = [];
    }
  }

  // Método para obtener información de una cuenta por CBU/Alias
  obtenerInfoCuenta(cbuOalias) {
    const registro = this.buscarDestino(cbuOalias);
    if (!registro) return null;
    
    return {
      titular: registro.titular.nombre,
      banco: registro.banco,
      cbu: registro.cbu,
      alias: registro.alias
    };
  }
}