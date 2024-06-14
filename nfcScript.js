console.log("hola");
const axios = require("axios");
const https = require("https");
//const io = require("socket.io-client")
const { NFC, KEY_TYPE_A } = require("nfc-pcsc");
// URL del servidor donde se encuentra la API REST
const serverUrl = "http://192.168.1.29:3000/";
//const socket = io(serverUrl);
// Crea una instancia de NFC
const nfc = new NFC();
var isCurso = false;
var isGrupo = false;
var isProf = false;
var isCarrera = false;
var isPañuelo = false;
var haveTipo = false;
var contCarrera = 0;
var contPañuelo = 0;
var contReg = 0;
let registrosEjercicio = {
  fecha : new Date().toISOString().slice(0,10),
  historial : []
};
var puntosEquipoA = 0;
var puntosEquipoB = 0;
let gameStarted = false;
let cards = [];
var registroEncontrado = false;
let contadorProf = 0;
const KEY_TYPE_B = 0x61;
console.log(new Date())
nfc.on("reader", (reader) => {
  
  console.log(reader.name + " reader attached, waiting for cards ...");
  async function handleCarrera(card,nfcDataToString) {
    
    let indiceC;
    indiceC = registrosEjercicio.historial.findIndex(carrera=>carrera.idNFC === card.uid)
    console.log(indiceC)
    if (indiceC != -1 && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup"))  {
      // La tarjeta ya se había leído para iniciar la carrera, ahora se finaliza
      registrosEjercicio.historial[indiceC].tiempoFinal = new Date();

      registrosEjercicio.historial[indiceC].tiempoTotal =(registrosEjercicio.historial[indiceC].tiempoFinal - registrosEjercicio.historial[indiceC].tiempoInicial) / 1000;
      console.log((registrosEjercicio.historial[indiceC].tiempoFinal - registrosEjercicio.historial[indiceC].tiempoInicial) / 1000)
      console.log(registrosEjercicio.historial[indiceC]);
      // Verifica si todas las tarjetas han finalizado la carrera
      //socket.emit('alumnoFinalizacionCarrera',registrosEjercicio.historial[indiceC])
      var bTodos = true;
      console.log(registrosEjercicio);
      Object.keys(registrosEjercicio.historial).forEach((uid) => {
        if (registrosEjercicio.historial[uid].tiempoFinal === undefined || registrosEjercicio.historial[uid].tiempoFinal == "" || !registrosEjercicio.historial[uid].tiempoFinal) {
          bTodos = false;
        }
      });
      
      console.log(bTodos);
      if (bTodos == true) {
        // Realiza una solicitud POST al servidor con los registros de la carrera
        console.log("ENTRA");
        
        registrosEjercicio.historial.forEach((alumno)=>{
          alumno.tiempoFinal = alumno.tiempoFinal.toISOString().slice(11,19)
          alumno.tiempoInicial = alumno.tiempoInicial.toISOString().slice(11,19)
          })
          console.log(registrosEjercicio)
        const response = await axios.post(serverUrl, registrosEjercicio);
        restart();
        //console.log('Datos de la carrera enviados al servidor:', response.data);
      }
    } else {
      // La tarjeta se lee por primera vez, se inicia la carrera
      if (card.uid != "04aab6c2926780" && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup")) {
        
        registrosEjercicio.historial.push( {
          idNFC: card.uid,
          tiempoInicial: new Date(),
        });
        console.log(registrosEjercicio);
        //socket.emit('alumnoComienzoCarrera',registrosEjercicio.historial[indiceC])
      }
    }
    
  }

  function restart() {
    isCarrera = false;
    isPañuelo = false;
    haveTipo = false;
    isCurso = false;
    isGrupo = false;
    isProf = false;
    contCarrera = 0;
    contPañuelo = 0;
    contReg = 0;
    registrosEjercicio = {
      fecha : new Date().toISOString().slice(0,10),
      historial : []
    };  
    puntosEquipoA = 0;
    puntosEquipoB = 0;
    gameStarted = false;
    cards = [];
    registroEncontrado = false;
    contadorProf = 0;
  }

  async function handlePañuelo(card,nfcDataToString) {
    let indiceP;
    console.log("pañuelo")
    console.log(nfcDataToString)
    if (gameStarted && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup")) {
      console.log("El registro ha comenzado");
      console.log(registroEncontrado)
      if (!registroEncontrado && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup")) {
        console.log("Jugador registrado")
        registrosEjercicio.historial.push({
          idNFC: card.uid,
          puntosIndividuales: 0
        });
        
        //const halfTeam = registroAlumnos.length / 2;
        
        //equipo = registroAlumnos.map(x=> x.idNFC).indexOf(card.uid) <= halfTeam  ? "A" : "B";
        //equipo = registroAlumnos.indexOf(registroAlumnos[card.uid]) % 2 === 0 ? 'A' : 'B';
        
        
      } else {
        if (card.uid !== "047d093a697484" && contadorProf == 2 && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup")) {
          console.log("El juego a comenzado")
          if(card.uid !== "047d093a697484" && contadorProf == 2 && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup") && contReg == 0){
            //socket.emit('finalizacionRegistro')
            contReg = contReg + 1;
          }
          indiceP = registrosEjercicio.historial.findIndex(alumno=>alumno.idNFC === card.uid)
          let halfTeam = registrosEjercicio.historial.length / 2;
          registrosEjercicio.historial.forEach((alumno,index)=>{
            if(!alumno.equipo){
            if(index<halfTeam){
              alumno.equipo = "A";
              }else{
              alumno.equipo = "B";
              }
            }
            })
            console.log(registrosEjercicio)
            console.log(indiceP)
            console.log(5/2)
          if (registrosEjercicio.historial[indiceP].equipo == "A") {
            registrosEjercicio.historial[indiceP].puntosIndividuales++;
            puntosEquipoA++;
            console.log(puntosEquipoA)
            console.log(registrosEjercicio.historial[indiceP])
            //socket.emit('puntoEquipoA',registrosEjercicio.historial[indiceP])
          } else {
            registrosEjercicio.historial[indiceP].puntosIndividuales++;
            puntosEquipoB++;
            console.log(puntosEquipoB)
            console.log(registrosEjercicio.historial[indiceP])
            //socket.emit('puntoEquipoB',registrosEjercicio.historial[indiceP])
          }
          if (puntosEquipoA == 7 || puntosEquipoB == 7) {
            console.log("ENTRA");
            if (puntosEquipoA == 7) {
              console.log("equipo a gana")
              registrosEjercicio.equipoGanador = "A";
            } else {
              console.log("equipo b gana")
              registrosEjercicio.equipoGanador = "B";
            }
            
            
            //console.log(datosEquipo)
            //socket.emit('finalizacionPañuelo')
            const response = await axios.post(serverUrl, registrosEjercicio);
            restart();
            
          }
        }
      }
    }
    if (card.uid === "047d093a697484"){ 
      contadorProf ++;
      gameStarted = true;
}
    // Envía los datos NFC al servidor
    // const response = await axios.post(serverUrl, card);
    //console.log('Datos NFC enviados al servidor:', response.data);
  }

  reader.on("card", async (card) => {
    /*
    await reader.authenticate(4,KEY_TYPE_B,'ffffffffffff')
    const nfcData123 = await reader.read(4,16,16)
    console.log(nfcData123)
    const nfcDataToString = nfcData123.toString();
    console.log(nfcDataToString)
    */
   const nfcData123 = await reader.read(7,6)
    const nfcDataToString = nfcData123.toString();
    console.log(nfcDataToString)
    console.log(card);
    if(nfcDataToString == "enprof"){
      isProf = true;
      registrosEjercicio.nfcIdProf = card.uid;
      //socket.emit('registroProfesor',registrosEjercicio.nfcIdProf)
}
    if(nfcDataToString == "encurs"){
      isCurso = true;
      
      if(card.uid === "0461b03a697480"){
      registrosEjercicio.curso = "primero";
    } else if(card.uid === "0448c53a697480"){
      registrosEjercicio.curso = "segundo";
    } else if(card.uid === "IDTERCERO"){
      registrosEjercicio.curso = "tercero";
    } else if(card.uid === "046f843a697480"){
      registrosEjercicio.curso = "cuarto";
    } else if(card.uid === "0448d73a697480"){
      registrosEjercicio.curso = "quinto";
    } else if(card.uid === "042e9a3a697480"){
      registrosEjercicio.curso = "sexto";
    } 
    //socket.emit('registroCurso',registrosEjercicio.curso)
} 
    if(nfcDataToString == "engrup"){
      isGrupo = true;
      if(card.uid === "0479053a697484"){
        registrosEjercicio.grupo = "A";
      } else if(card.uid === "0466b53a697480"){
        registrosEjercicio.grupo = "B";
      } 
      //socket.emit('registroGrupo',registrosEjercicio.grupo)
}
    registroEncontrado = cards.some((c) => c === card.uid);
    console.log(!registroEncontrado && (card.uid === "047d093a697484"))
    if (!registroEncontrado && (card.uid === "047d093a697484" || cards.indexOf("047d093a697484") == 0) && (nfcDataToString !== "encurs" && nfcDataToString !== "enprof" && nfcDataToString !== "engrup")) cards.push(card.uid);
    console.log(cards);
    console.log(registroEncontrado);
    console.log(registrosEjercicio);
    if (card.uid === "04aab6c2926780" && isProf && isGrupo && isCurso) {
      isCarrera = true;
      if(isCarrera==true && contCarrera == 0){
        //socket.emit('comienzoCarrera')
        contCarrera = contCarrera + 1;
      }
      if(!haveTipo){
        registrosEjercicio.tipo = "carrera";
        haveTipo = true;
      }
      
    }
    if (card.uid === "047d093a697484" && isProf && isGrupo && isCurso) {
      isPañuelo = true;
      if(isPañuelo==true && contPañuelo == 0){
       // socket.emit('comienzoPañuelo')
        contPañuelo = contPañuelo + 1;
      }
      if(!haveTipo){
        registrosEjercicio.tipo = "scarf";
        haveTipo = true;
      }
      
    }
    if (isCarrera == true) {
      console.log("carrera");

      handleCarrera(card,nfcDataToString);
      
    } else if (isPañuelo == true) {
      handlePañuelo(card,nfcDataToString);
     
    }
  });

  reader.on("error", (err) => {
    console.error("reader error", err);
  });

  reader.on("end", () => {
    console.log(reader.name + " reader disconnected.");
  });
});