 //************* SERVICIO PARA MONGO DB */

 const mongoose = require('mongoose');


 const RolesSchema = require('../models/SchemasMongoDB/roles');
const UserSchema = require('../models/SchemasMongoDB/usuarios');
const processSchema = require('../models/SchemasMongoDB/procesos');
const catalogSchema = require('../models/SchemasMongoDB/catalogos');
const viewsSchema = require('../models/SchemasMongoDB/vistas');




//**************  GET ALLL */
async function GetAllRoles(req) {
  try {
    let role = await RolesSchema.find().lean(); 
    return role;
  } catch (error) {
    return error;
  }
}

//************** GET USUARIO */
async function getRoleWithUsers(req) {
  const { roleid } = req.data;   
    if (!req) throw new Error("Missing roleid");

    const role = await RolesSchema.findOne({ ROLEID: roleid }).lean();
    if (!role) throw new Error("Role not found");

    const users = await UserSchema.find({ ROLEID: roleid }).lean();

    const formattedUsers = users.map(u => ({
        USERID: u.USERID,
        USERNAME: u.USERNAME,
        COMPANYNAME: u.COMPANYNAME,
        DEPARTMENT: u.DEPARTMENT
    }));

    return {
        ...role,
        USERS: formattedUsers
    };
}

//*************** CREAR ROL  */
async function CreateRoleService(req) {
  try {
    const data = req.data;

    // ✅ Validación para prevenir duplicados por ROLEID
    const existingRole = await RolesSchema.findOne({ ROLEID: data.ROLEID }).lean();
    if (existingRole) {
      return {
        success: false,
        message: `Ya existe un rol con el ID '${data.ROLEID}'.`
      };
    }

    const processes = data.PROCESSES;
    const allRoles = await RolesSchema.find().lean();

    for (const process of processes) {
      const foundProcess = await processSchema.findOne({ LABELID: process.PROCESSID });
      if (!foundProcess) {
        return {
          success: false,
          message: `El proceso con ID '${process.PROCESSID}' no existe.`
        };
      }

      const foundView = await viewsSchema.findOne({ LABELID: process.VIEWID });
      if (!foundView) {
        return {
          success: false,
          message: `La vista con ID '${process.VIEWID}' no existe.`
        };
      }

      for (const privilege of process.PRIVILEGES) {
        let exists = false;

        for (const role of allRoles) {
          for (const proc of role.PROCESSES || []) {
            for (const priv of proc.PRIVILEGES || []) {
              if (priv.PRIVILEGEID === privilege.PRIVILEGEID) {
                exists = true;
                break;
              }
            }
            if (exists) break;
          }
          if (exists) break;
        }

        if (!exists) {
          return {
            success: false,
            message: `El privilegio con ID '${privilege.PRIVILEGEID}' no existe.`
          };
        }

        privilege._id = new mongoose.Types.ObjectId();
      }

      process._id = new mongoose.Types.ObjectId();
    }

    if (data.DETAIL_ROW?.DETAIL_ROW_REG) {
      data.DETAIL_ROW.DETAIL_ROW_REG = data.DETAIL_ROW.DETAIL_ROW_REG.map(reg => ({
        ...reg,
        REGDATE: new Date(),
        REGTIME: new Date(),
        _id: new mongoose.Types.ObjectId()
      }));
    }

    const newRole = new RolesSchema(data);
    const saved = await newRole.save();
    return saved.toObject();

  } catch (error) {
    console.error('Error al crear el rol:', error);
    return {
      success: false,
      message: 'Error interno del servidor.'
    };
  }
}




async function UpdateRolByRoleID(req) {
  try {
    const { ROLEID, PROCESSES = [], ...rest } = req.data;

    // Buscar el rol actual
    const rol = await RolesSchema.findOne({ ROLEID });
    if (!rol) {
      return { success: false, message: 'No se encontró un documento con ese ROLEID.' };
    }

    // Actualizar campos generales si vienen en la petición
    const camposGenerales = {};
    for (const key in rest) {
      if (rest[key] !== undefined) {
        camposGenerales[key] = rest[key];
      }
    }

    if (Object.keys(camposGenerales).length > 0) {
      await RolesSchema.updateOne({ ROLEID }, { $set: camposGenerales });
    }

    // Clonamos la lista actual de procesos
    const procesosActuales = rol.PROCESSES || [];

    for (const nuevoProceso of PROCESSES) {
      // Validar existencia del proceso
      const procesoValido = await processSchema.findOne({ LABELID: nuevoProceso.PROCESSID });
      if (!procesoValido) {
        return { success: false, message: `Proceso ${nuevoProceso.PROCESSID} no encontrado.` };
      }

      const indexProceso = procesosActuales.findIndex(p => p.PROCESSID === nuevoProceso.PROCESSID);

      if (indexProceso === -1) {
        // Proceso nuevo, agregar completo
        procesosActuales.push(nuevoProceso);
      } else {
        // Proceso existente, actualizar campos básicos
        const procesoExistente = procesosActuales[indexProceso];
        const procesoActualizado = {
          ...procesoExistente,
          ...nuevoProceso
        };

        // Si vienen privilegios en el JSON, actualizar/agregar los correspondientes
        if (Array.isArray(nuevoProceso.PRIVILEGES)) {
          const privilegiosActuales = procesoExistente.PRIVILEGES || [];

          for (const nuevoPrivilegio of nuevoProceso.PRIVILEGES) {
            const indexPrivilegio = privilegiosActuales.findIndex(
              p => p.PRIVILEGEID === nuevoPrivilegio.PRIVILEGEID
            );

            if (indexPrivilegio === -1) {
              privilegiosActuales.push(nuevoPrivilegio);
            } else {
              privilegiosActuales[indexPrivilegio] = {
                ...privilegiosActuales[indexPrivilegio],
                ...nuevoPrivilegio
              };
            }
          }

          procesoActualizado.PRIVILEGES = privilegiosActuales;
        }

        procesosActuales[indexProceso] = procesoActualizado;
      }
    }

    // Guardar los cambios
    const updatedDoc = await RolesSchema.findOneAndUpdate(
      { ROLEID },
      { $set: { PROCESSES: procesosActuales } },
      { new: true }
    );

    return { success: true, data: updatedDoc };
  } catch (error) {
    console.error('Error en UpdateRolByRoleID:', error);
    return { success: false, message: 'Error al actualizar el documento.', error };
  }
}

//                  Delete Logico de roles 
async function DeleteRoleLogical(req) {
  const { roleid } = req.data;
  if (!roleid) {
    throw Object.assign(new Error("Se requiere 'roleid'"), { status: 400 });
  }

  //Leer el rol actual
  const current = await RolesSchema.findOne({ ROLEID: roleid });
  if (!current) {
    throw Object.assign(new Error(`Rol ${roleid} no encontrado`), { status: 404 });
  }

  //Invertir valores
  const newActivated = !current.DETAIL_ROW.ACTIVED;
  const newDeleted   = !newActivated;
  const now          = new Date();

  //Actualizar el documento con los nuevos valores y registro de auditoría
  const updated = await RolesSchema.findOneAndUpdate(
    { ROLEID: roleid },
    {
      $set: {
        'DETAIL_ROW.ACTIVED': newActivated,
        'DETAIL_ROW.DELETED': newDeleted
      },
      $push: {
        'DETAIL_ROW.DETAIL_ROW_REG': {
          CURRENT: newActivated,
          REGDATE: now,
          REGTIME: now
        }
      }
    },
    { new: true }
  );
  // Construir mensaje según el nuevo estado
  const message = newActivated
    ? 'El rol se encuentra ACTIVO'
    : 'El rol se encuentra INACTIVO';

  return { message };
}

//Delete fisico de roles
async function DeleteRoleById(req) {
  const { roleid } = req.data;
  if (!roleid) {
    throw new Error("Se requiere 'roleid'");
  }
  const result = await RolesSchema.findOneAndDelete({ ROLEID: roleid }).lean();
  if (!result) {
    throw new Error(`Rol con ROLEID=${roleid} no encontrado`);
  }
  return result;
}

module.exports = {
  GetAllRoles,
  getRoleWithUsers,
  CreateRoleService,
  UpdateRolByRoleID,
  DeleteRoleLogical,
  DeleteRoleById
};