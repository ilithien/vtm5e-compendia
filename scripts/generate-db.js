const fs = require("fs");
const path = require("path");
const Datastore = require("nedb");

// Ruta del directorio que contiene los archivos JSON
const inputDirectory = "./data";
const outputDirectory = "./packs";

function clearOutputDirectory() {
    fs.readdir(outputDirectory, (err, files) => {
      if (err) {
        console.error("Error al leer el directorio de salida:", err);
        return;
      }
  
      files.forEach((file) => {
        const filePath = path.join(outputDirectory, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo ${file}:`, err);
          } else {
            console.log(`Archivo eliminado: ${file}`);
          }
        });
      });
    });
  }
  

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Función para procesar los archivos JSON
function processJsonFiles() {
  // Leer todos los archivos del directorio
  fs.readdir(inputDirectory, (err, files) => {
    if (err) {
      console.error("Error al leer el directorio:", err);
      return;
    }

    // Filtrar solo los archivos JSON
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    // Procesar cada archivo JSON
    jsonFiles.forEach((file) => {
      const filePath = path.join(inputDirectory, file);

      // Leer el contenido del archivo JSON
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error al leer el archivo ${file}:`, err);
          return;
        }

        try {
          const jsonData = JSON.parse(data);

          // Verificar si el JSON tiene la propiedad "items"
          if (!Array.isArray(jsonData.items)) {
            console.warn(`El archivo ${file} no tiene una propiedad "items" válida.`);
            return;
          }

          

          // Crear un archivo .db con los datos de "items"
          const dbFileName = path.basename(file, ".json") + ".db";
          const dbFilePath = path.join(outputDirectory, dbFileName);

          const db = new Datastore({ filename: dbFilePath, autoload: true });

          // Insertar los items en la base de datos
          db.insert(jsonData.items, (err) => {
            if (err) {
              console.error(`Error al insertar datos en ${dbFileName}:`, err);
            } else {
              console.log(`Datos del archivo ${file} guardados en ${dbFileName}`);
            }
          });
        } catch (parseError) {
          console.error(`Error al parsear el archivo ${file}:`, parseError);
        }
      });
    });
  });
}

clearOutputDirectory();
setTimeout(processJsonFiles, 1000); // Es