//************* SERVICIO PARA MONGO DB */
const viewsSchema = require('../models/SchemasMongoDB/vistas');

async function GetAllViews(req) {
  try {
    const allViews = await viewsSchema.find({});
    const cleanedViews = allViews.map(view => {
      const { __v, ...cleaned } = view.toObject();
      return cleaned;
    });

    return cleanedViews;
  } catch (error) {
    console.error('Error al obtener todas las vistas:', error);
    return [];
  }
}


async function CreateViewService(req) {
  try {
    const data = req.data;

    // Validación básica de LABELID
    if (!data.LABELID || typeof data.LABELID !== 'string' || !data.LABELID.trim()) {
      return {
        success: false,
        message: 'El campo LABELID es obligatorio y debe ser una cadena válida.'
      };
    }

    // Convertimos LABELID a mayúsculas para estandarizar 
    //  data.LABELID = data.LABELID.trim().toUpperCase();

    // Validar duplicado por LABELID
    const existingView = await viewsSchema.findOne({ LABELID: data.LABELID });
    if (existingView) {
      return {
        success: false,
        message: `Ya existe una vista con el LABELID '${data.LABELID}'.`
      };
    }

    // Establecer timestamps si no vienen
    if (!data.updatedAt) data.updatedAt = new Date();
    if (!data.createdAt) data.createdAt = new Date();

    // Crear y guardar vista
    const newView = new viewsSchema(data);
    const saved = await newView.save();

    // Convertimos el documento a objeto plano y eliminamos __v
    const cleanResult = saved.toObject();
    delete cleanResult.__v;

    return {
      success: true,
      data: cleanResult
    };

  } catch (error) {
    console.error('Error al crear la vista:', error.message);
    return {
      success: false,
      message: 'Error al crear la vista',
      error: error.message
    };
  }
}



async function UpdateViewByCompanyId(req) {
  try {
    const { LABELID, ...rest } = req.data;

    // Filtramos solo los campos que realmente se enviaron (no undefined)
    const updateData = {};
    for (const key in rest) {
      if (rest[key] !== undefined) {
        updateData[key] = rest[key];
      }
    }

    const updatedDoc = await viewsSchema.findOneAndUpdate(
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
    //Delete de views por id
    async function DeleteViewByCompanyId(req) {
      const { COMPANYID } = req.data;
      if (COMPANYID == null) {
        throw new Error("Se requiere 'COMPANYID'");
      }

      const result = await viewsSchema.findOneAndDelete({ COMPANYID }).lean();
      if (!result) {
        throw new Error(`No se encontró ningún documento con COMPANYID=${COMPANYID}`);
      }
      return result;
    }

module.exports = {
  GetAllViews,
  CreateViewService,
  UpdateViewByCompanyId,
  DeleteViewByCompanyId
};