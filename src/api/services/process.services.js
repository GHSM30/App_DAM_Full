//************* SERVICIO PARA MONGO DB */
const processSchema = require('../models/SchemasMongoDB/procesos');
const procesoSchema = require('../models/SchemasMongoDB/procesos');



// Obtener todos los procesos
async function GetAllProcess(req) {
  try {
    const allProcesses = await processSchema.find({});
    const cleanedProcesses = allProcesses.map(proc => {
      const { __v, ...cleaned } = proc.toObject();
      return cleaned;
    });

    return cleanedProcesses;
  } catch (error) {
    console.error('Error al obtener todos los procesos:', error);
    return [];
  }
}

async function CreateProcessService(req) {
  try {
    const data = req.data;

    // Validar que no exista un proceso con el mismo LABELID
    const existing = await processSchema.findOne({ LABELID: data.LABELID }).lean();
    if (existing) {
      return {
        success: false,
        message: `Ya existe un proceso con el LABELID '${data.LABELID}'.`
      };
    }

    if (!data.updatedAt) {
      data.updatedAt = new Date();
    }

    const newProcess = new processSchema(data);
    await newProcess.save();

    return {
      success: true,
      message: 'Proceso creado exitosamente'
    };
  } catch (error) {
    console.error('Error al crear el proceso:', error.message);
    return {
      success: false,
      message: 'Error al crear el proceso'
    };
  }
}


// Actualizar un proceso por LABELID
async function UpdateProcesByLABELId(req) {
  try {
    const { LABELID, ...rest } = req.data;

    // Filtramos solo los campos que realmente se enviaron (no undefined)
    const updateData = {};
    for (const key in rest) {
      if (rest[key] !== undefined) {
        updateData[key] = rest[key];
      }
    }

    const updatedDoc = await processSchema.findOneAndUpdate(
      { LABELID },
      { $set: updateData },
      { new: true }
    );

    if (!updatedDoc) {
      return { success: false, message: 'No se encontró un documento con ese LABELID.' };
    }

    return { success: true, data: updatedDoc };
  } catch (error) {
    return { success: false, message: 'Error al actualizar el documento.', error };
  }
}

// Borrado físico de un proceso por LABELID
async function DeleteProcessByLABELId(req) {
  try {
    const { LABELID } = req.data;

    const deletedDoc = await procesoSchema.findOneAndDelete({ LABELID }); 

    if (!deletedDoc) {
      return { success: false, message: 'No se encontró un proceso con ese LABELID.' };
    }

    return {
      success: true,
      message: 'Proceso eliminado correctamente.',
      data: deletedDoc
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al eliminar el proceso.',
      error: error.message || error
    };
  }
}



module.exports = {
  GetAllProcess,
  CreateProcessService,
  UpdateProcesByLABELId,
  DeleteProcessByLABELId
};
