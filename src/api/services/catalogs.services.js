//************* SERVICIO PARA MONGO DB */
const catalogsSchema = require('../models/SchemasMongoDB/catalogos');


async function GetAllCatalogs(req) {
  try {
    let catalog = await catalogsSchema.find().lean(); 
    return catalog;
  } catch (error) {
    return error;
  }
}

async function GetCatalogOne(req) {
  try {
    const { VALUEID } = req.data;  

    // Buscar el registro en MongoDB
    const catalog = await catalogsSchema.findOne({ VALUEID }).lean();

    if (!catalog) {
      throw new Error(`No se encontró un registro con el VALUEID ${VALUEID}`);
    }

    return catalog;
  } catch (error) {
    throw new Error(`Error al obtener el registro de precios por ID: ${error.message}`);
  }
}

async function CreateCatalog(req) {
  try {
    const {
      LABELID, LABEL, INDEX, COLLECTION, SECTION, SEQUENCE,
      IMAGE, DESCRIPTION, REGUSER
    } = req.data;

    if ( !LABEL || !REGUSER) {
      return {
        success: false,
        message: "Los campos LABELID, LABEL, son obligatorios."
      };
    }

    // Verifica si ya existe un catálogo con ese VALUEID
    const existing = await catalogsSchema.findOne({ VALUEID });

    if (existing) {
      return {
        success: false,
        message: `Ya existe un catálogo con el VALUEID '${VALUEID}'.`
      };
    }

    const newCatalog = new catalogsSchema({
      LABELID,
      LABEL,
      INDEX,
      COLLECTION,
      SECTION,
      SEQUENCE,
      IMAGE,
      DESCRIPTION,
      DETAIL_ROW: {
        ACTIVED: true,
        DELETED: false,
        DETAIL_ROW_REG: [
          {
            CURRENT: true,
            REGDATE: new Date(),
            REGTIME: new Date(),
            REGUSER
          }
        ]
      }
    });

    await newCatalog.save();

    const created = newCatalog.toObject();
    delete created.__v;

    return {
      success: true,
      message: "Catálogo creado correctamente.",
      data: created
    };
  } catch (error) {
    console.error("Error en CreateCatalog:", error);
    return {
      success: false,
      message: "Ocurrió un error al crear el catálogo.",
      error: error.message
    };
  }
}


async function CatalogosDeleteById(req) {
  try {
    // Obtener el parámetro directamente desde el body o query (según cómo lo mandes)
    const { ValueId } = req.data || req.body;
    //Valida que el dato existe
    if (!ValueId || typeof ValueId !== 'string') {
      return {
        status: 400,
        message: 'Debe proporcionar un ValueId válido'
      };
    }

    // Buscar y eliminar el documento
    const deleted = await catalogsSchema.findOneAndDelete({ VALUEID: ValueId }).lean();

    if (!deleted) {
      return {
        status: 404,
        message: `No se encontró un registro con el VALUEID "${ValueId}"`
      };
    }

    return deleted; 
  } catch (error) {
    console.error('Error en CatalogosDeleteById:', error);
    return {
      status: 500,
      message: `Error al eliminar el catálogo: ${error.message}`
    };
  }
}

//Delete Logico de Catalogos
async function DeleteCatalogoLogical(req) {
  const { ValueId, activated, reguser } = req.data;
  //validaciones
  const result = await catalogsSchema.findOneAndUpdate(
    { VALUEID: ValueId }, 
    {
      $set: {
        'DETAIL_ROW.ACTIVED': activated,
        'DETAIL_ROW.DELETED': !activated
      },
      $push: {
        'DETAIL_ROW.DETAIL_ROW_REG': {
          CURRENT: activated,
          REGDATE: new Date(),
          REGTIME: new Date(),
          REGUSER: reguser
        }
      }
    },
    { new: true }
  ).lean();

  if (!result) throw new Error(`Catalogo ${ValueId} no encontrado`);
  return result;               
}

async function GetCatalogsByApplicationId(req) {
    const { LABELID } = req.data;

    if (!LABELID) throw new Error("LABELID is required");

    const results = await catalogsSchema.find({ LABELID }).lean();

    return results;
}


async function GetCatalogsByValueId(req) {
    const { ValueId } = req.data;

    if (!ValueId) throw new Error("ValueId is required");

    const results = await Catalogo.find({ ValueId }).lean();

    return results;
}

async function UpdateCatalogByValueId(req) {
  try {
    const {
      VALUEID, LABEL, INDEX, COLLECTION, SECTION, SEQUENCE,
      IMAGE, DESCRIPTION, REGUSER
    } = req.data;

    if (!VALUEID) {
      return {
        success: false,
        message: "El campo VALUEID es obligatorio."
      };
    }

    const catalog = await catalogsSchema.findOne({ VALUEID });

    if (!catalog) {
      return {
        success: false,
        message: `No se encontró un catálogo con VALUEID '${VALUEID}'.`
      };
    }

    // Marcar los registros anteriores como CURRENT: false
    if (catalog.DETAIL_ROW?.DETAIL_ROW_REG?.length > 0) {
      catalog.DETAIL_ROW.DETAIL_ROW_REG.forEach(reg => {
        reg.CURRENT = false;
      });
    }

    // Agregar nuevo registro de auditoría
    const newLog = {
      CURRENT: true,
      REGDATE: new Date(),
      REGTIME: new Date(),
      REGUSER: REGUSER || "system"
    };

    catalog.DETAIL_ROW.DETAIL_ROW_REG.push(newLog);

    // Actualizar campos permitidos
    if (LABEL !== undefined) catalog.LABEL = LABEL;
    if (INDEX !== undefined) catalog.INDEX = INDEX;
    if (COLLECTION !== undefined) catalog.COLLECTION = COLLECTION;
    if (SECTION !== undefined) catalog.SECTION = SECTION;
    if (SEQUENCE !== undefined) catalog.SEQUENCE = SEQUENCE;
    if (IMAGE !== undefined) catalog.IMAGE = IMAGE;
    if (DESCRIPTION !== undefined) catalog.DESCRIPTION = DESCRIPTION;

    // Guardar cambios
    await catalog.save();

    // Convertir a objeto plano y eliminar __v antes de devolverlo
    const cleaned = catalog.toObject();
    delete cleaned.__v;

    return {
      success: true,
      message: "Catálogo actualizado correctamente.",
      data: cleaned
    };

  } catch (error) {
    console.error("Error en UpdateCatalogByValueId:", error);
    return {
      success: false,
      message: "Ocurrió un error al actualizar el catálogo.",
      error: error.message
    };
  }
}

module.exports = {
  GetAllCatalogs,
  CatalogosDeleteById,
  GetCatalogsByApplicationId,
  GetCatalogsByValueId, 
  GetCatalogOne,
  CreateCatalog,
  UpdateCatalogByValueId,
  DeleteCatalogoLogical
};