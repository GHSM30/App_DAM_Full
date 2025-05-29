//************* SERVICIO PARA MONGO DB */
const usersSchema = require('../models/SchemasMongoDB/usuarios');
const rolesSchema = require('../models/SchemasMongoDB/roles');
const processSchema = require('../models/SchemasMongoDB/procesos');

async function GetAllUsers(req) {
  try {
    let user = await usersSchema.find().lean(); 
    return user;
  } catch (error) {
    return error;
  }
}

// Obtener un solo usuario por USERID
async function getOneUserById(req) {
  try {
    const USERID = req.data.USERID || req.params.USERID || req.query.USERID;

    if (!USERID) {
      return {
        status: 400,
        message: 'Se requiere el USERID para buscar el usuario.'
      };
    }

    const usuario = await usersSchema.findOne({ USERID }).lean();

    if (!usuario) {
      return {
        status: 404,
        message: `No se encontró usuario con USERID: ${USERID}`
      };
    }

    return {
      status: 200,
      data: usuario
    };

  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return {
      status: 500,
      message: 'Error interno al obtener usuario por ID',
      error: error.message
    };
  }
}


// Crear nuevo usuario con validación de roles
async function CreateUser(req) {
  try {
    const data = req.data.user || req.body.user;

    // Validar campos obligatorios
    if (!data.USERID || !data.USERNAME || !data.PASSWORD || !data.EMAIL) {
      return {
        status: 400,
        message: 'Faltan campos obligatorios: USERID, USERNAME, PASSWORD, EMAIL'
      };
    }

    // Verificar si el usuario ya existe
    const existingUser = await usersSchema.findOne({ USERID: data.USERID });
    if (existingUser) {
      return {
        status: 409,
        message: `El usuario con USERID "${data.USERID}" ya existe.`
      };
    }

    // Validar roles si existen
    if (data.ROLES && data.ROLES.length > 0) {
      const roleIds = data.ROLES.map(r => r.ROLEID);
      
      // Buscar todos los roles válidos
      const existingRoles = await rolesSchema.find({ ROLEID: { $in: roleIds } }).lean();
      const existingRoleIds = existingRoles.map(r => r.ROLEID);

      // Verificar si hay alguno inválido
      const invalidRoles = roleIds.filter(r => !existingRoleIds.includes(r));
      if (invalidRoles.length > 0) {
        return {
          status: 400,
          message: `Los siguientes ROLEID no existen en la base de datos: ${invalidRoles.join(', ')}`
        };
      }
    }

    // Crear el nuevo usuario
    const nuevoUsuario = new usersSchema(data);
    await nuevoUsuario.save();

    return {
      status: 201,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario
    };

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return {
      status: 500,
      message: 'Error interno al crear usuario',
      error: error.message
    };
  }
}
 
//PUT de usuario
async function UpdateUserByUSERID(req) {
  try {
    const {
      USERID,
      ROLES,
      ...camposRestantes
    } = req.data;

    const usuario = await usersSchema.findOne({ USERID });
    if (!usuario) {
      return { success: false, message: 'No se encontró un usuario con ese USERID.' };
    }

    // 1. Actualizar los campos generales proporcionados (sin borrar lo que no se mande)
    const datosActualizar = {};
    for (const key in camposRestantes) {
      if (camposRestantes[key] !== undefined) {
        datosActualizar[key] = camposRestantes[key];
      }
    }

    if (Object.keys(datosActualizar).length > 0) {
      await usersSchema.updateOne({ USERID }, { $set: datosActualizar });
    }

    // 2. Procesar los ROLES (si vienen en el JSON)
    if (Array.isArray(ROLES)) {
      const rolesActuales = usuario.ROLES || [];

      for (const nuevoRol of ROLES) {
        // Verificar que el rol exista
        const rolValido = await rolesSchema.findOne({ ROLEID: nuevoRol.ROLEID });
        if (!rolValido) {
          return { error: `Rol ${nuevoRol.ROLEID} no encontrado en rolesSchema.` };
        }

        const indexRol = rolesActuales.findIndex(r => r.ROLEID === nuevoRol.ROLEID);

        if (indexRol === -1) {
          // Agregar el rol completo
          await usersSchema.updateOne({ USERID }, { $push: { ROLES: nuevoRol } });
        } else {
          // Actualizar campos básicos del rol
          const camposRol = {
            [`ROLES.${indexRol}.ROLEIDSAP`]: nuevoRol.ROLEIDSAP,
            [`ROLES.${indexRol}.ROLENAME`]: nuevoRol.ROLENAME,
            [`ROLES.${indexRol}.DESCRIPTION`]: nuevoRol.DESCRIPTION
          };
          await usersSchema.updateOne({ USERID }, { $set: camposRol });

          // Procesar los procesos si vienen
          if (Array.isArray(nuevoRol.PROCESSES)) {
            const procesosActuales = usuario.ROLES[indexRol].PROCESSES || [];

            for (const nuevoProceso of nuevoRol.PROCESSES) {
              const procesoValido = await processSchema.findOne({ LABELID: nuevoProceso.PROCESSID });
              if (!procesoValido) {
                return { error: `Proceso ${nuevoProceso.PROCESSID} no encontrado en processSchema.` };
              }

              const indexProceso = procesosActuales.findIndex(
                p => p.PROCESSID === nuevoProceso.PROCESSID
              );

              if (indexProceso === -1) {
                // Agregar proceso nuevo
                await usersSchema.updateOne(
                  { USERID },
                  { $push: { [`ROLES.${indexRol}.PROCESSES`]: nuevoProceso } }
                );
              } else {
                // Actualizar campos del proceso existente
                const camposProceso = {
                  [`ROLES.${indexRol}.PROCESSES.${indexProceso}.PROCESSNAME`]: nuevoProceso.PROCESSNAME,
                  [`ROLES.${indexRol}.PROCESSES.${indexProceso}.VIEWID`]: nuevoProceso.VIEWID,
                  [`ROLES.${indexRol}.PROCESSES.${indexProceso}.VIEWNAME`]: nuevoProceso.VIEWNAME,
                  [`ROLES.${indexRol}.PROCESSES.${indexProceso}.APPLICATIONID`]: nuevoProceso.APPLICATIONID,
                  [`ROLES.${indexRol}.PROCESSES.${indexProceso}.APPLICATIONNAME`]: nuevoProceso.APPLICATIONNAME
                };
                await usersSchema.updateOne({ USERID }, { $set: camposProceso });

                // Procesar privilegios
                if (Array.isArray(nuevoProceso.PRIVILEGES)) {
                  const privilegiosActuales = procesosActuales[indexProceso]?.PRIVILEGES || [];

                  for (const nuevoPrivilegio of nuevoProceso.PRIVILEGES) {
                    const indexPrivilegio = privilegiosActuales.findIndex(
                      p => p.PRIVILEGEID === nuevoPrivilegio.PRIVILEGEID
                    );

                    if (indexPrivilegio === -1) {
                      // Agregar nuevo privilegio
                      await usersSchema.updateOne(
                        { USERID },
                        {
                          $push: {
                            [`ROLES.${indexRol}.PROCESSES.${indexProceso}.PRIVILEGES`]: nuevoPrivilegio
                          }
                        }
                      );
                    } else {
                      // Actualizar privilegio existente
                      await usersSchema.updateOne(
                        { USERID },
                        {
                          $set: {
                            [`ROLES.${indexRol}.PROCESSES.${indexProceso}.PRIVILEGES.${indexPrivilegio}.PRIVILEGENAME`]: nuevoPrivilegio.PRIVILEGENAME
                          }
                        }
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // 3. Devolver el usuario actualizado
    const usuarioActualizado = await usersSchema.findOne({ USERID });
    return { success: true, data: usuarioActualizado };

  } catch (error) {
    return { success: false, message: 'Error al actualizar el usuario.', error };
  }
}
//funcion para borrado logico
//eliminacion de usuario
// Cambiar estado ACTIVED y ajustar automáticamente DELETED
const DeleteUserLogical = async (req) => {
  try {
    const { USERID, ACTIVED } = req.data;

    // Validación estricta de tipo booleano
    if (typeof ACTIVED !== 'boolean') {
      return {
        success: false,
        message: 'El campo ACTIVED debe ser booleano (true o false).'
      };
    }

    const updatedUser = await usersSchema.findOneAndUpdate(
      { USERID: USERID },
      {
        $set: {
          'DETAIL_ROW.ACTIVED': ACTIVED,
          'DETAIL_ROW.DELETED': !ACTIVED
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return {
        success: false,
        message: `No se encontró el usuario con ID: ${USERID}`
      };
    }

    return {
      success: true,
      message: `Usuario ${ACTIVED ? 'activado' : 'desactivado'} correctamente.`,
      USERID: USERID
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Error al actualizar el estado del usuario.',
      error: error.message
    };
  }
};

// Borrado físico (elimina el documento completamente)
const DeleteUserPhysical = async (req) => {
  try {
    const { USERID } = req.data;
    if (!USERID) {
      return {
        success: false,
        message: 'Se requiere el USERID para eliminar el usuario.'
      };
    }

    // Verificar si el usuario existe 
    const usuario = await usersSchema.findOne({ USERID });
    if (!usuario) {
      return {
        success: false,
        message: `No se encontró el usuario con ID: ${USERID}`
      };
    }

    // Solo permitir borrado físico si ya ha sido borrado lógicamente
    if (usuario.DETAIL_ROW?.DELETED !== true) {
      return {
        success: false,
        message: `No se puede eliminar físicamente el usuario con ID: ${USERID} porque no ha sido eliminado lógicamente.`
      };
    }

    // Si fue eliminado lógicamente, permitir el borrado físico
    const result = await usersSchema.deleteOne({ USERID });
    if (result.deletedCount === 0) {
      return {
        success: false,
        message: `No se pudo eliminar el usuario con ID: ${USERID}`
      };
    }

    return {
      success: true,
      message: `Usuario con ID ${USERID} eliminado físicamente.`,
      USERID
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Error al eliminar el usuario.',
      error: error.message
    };
  }
};


module.exports = {
  GetAllUsers,
  getOneUserById,
  CreateUser,
  UpdateUserByUSERID, 
  DeleteUserLogical,
  DeleteUserPhysical
};