const cds = require('@sap/cds');
const { GetAllCatalogs, CatalogosDeleteById, GetCatalogsByApplicationId, GetCatalogsByValueId, GetCatalogOne,UpdateCatalogByValueId, DeleteCatalogoLogical, CreateCatalog } = require('../services/catalogs.services');
const { GetAllProcess, UpdateProcesByLABELId, CreateProcessService, DeleteProcessByLABELId } = require('../services/process.services');
const { GetAllUsers, getOneUserById, UpdateUserByUSERID, CreateUser, DeleteUserLogical, DeleteUserPhysical } = require('../services/users.services');
const { GetAllViews, UpdateViewByCompanyId, CreateViewService, DeleteViewByCompanyId } = require('../services/views.services');
const { GetAllRoles, getRoleWithUsers,CreateRoleService, UpdateRolByRoleID, DeleteRoleLogical, DeleteRoleById } = require('../services/roles.services');


module.exports = class dbsecurityClass extends cds.ApplicationService {
    async init() {
        //****************** PARA CATALOGS ***********************/
        this.on('GetAllCatalogs', async (req) => {
            return await GetAllCatalogs(req);
        });

        this.on('CatalogosDeleteById', async (req) => {
            return await CatalogosDeleteById(req);
        });

        this.on('DeleteCatalogoLogical', async (req) => {
            return await DeleteCatalogoLogical(req);
        });
        
        this.on('GetCatalogsByApplicationId', async (req) => {
            return await GetCatalogsByApplicationId(req);
        });
   
        this.on('GetCatalogsByValueId', async (req) => {
            return await GetCatalogsByValueId(req);
        });

        this.on('GetCatalogOne', async (req) => {
            return await GetCatalogOne(req);
        })
        this.on('UpdateCatalogByValueId', async (req) => {
            return await UpdateCatalogByValueId(req);
          });
          
        this.on('CreateCatalog', async (req) => {
            return await CreateCatalog(req);
          });

         //****************** PARA PROCESS ***********************/
        this.on('GetAllProcess', async (req) => {
            return await GetAllProcess(req);
        });

        this.on('CreateProcess', async (req) => {
            return await CreateProcessService(req);
          });

        this.on('UpdateProcesByLABELId', async (req) => {
            return await UpdateProcesByLABELId(req);
        });

        this.on('DeleteProcessByLABELId', async (req) => {
            return await DeleteProcessByLABELId(req);
        });

         //****************** PARA USERS ***********************/
        this.on('GetAllUsers', async (req) => {
            return await GetAllUsers(req);
        });

        this.on('getOneUserById', async (req) => {
            return await getOneUserById(req);
        });

        this.on('CreateUser', async (req) => {
            return await CreateUser(req);
        });
        
        this.on('UpdateUserByUSERID', async (req) => {
            return await UpdateUserByUSERID(req);
        });
        
        //borrado logico
        this.on('DeleteUserLogical', async (req) => {
            return await DeleteUserLogical(req);
        });
        //borrado fisico
        this.on('DeleteUserPhysical', async (req) => {
        return await DeleteUserPhysical(req);
        });

         //****************** PARA VIEWS ***********************/
        this.on('GetAllViews', async (req) => {
            return await GetAllViews(req);
        });

        this.on('CreateView', async (req) => {
            return await CreateViewService(req);
          });
          
        this.on('UpdateViewByCompanyId', async (req) => {
            return await UpdateViewByCompanyId(req);
        });
        //Delete de views por id
        this.on('DeleteViewByCompanyId', async req => {
        return await DeleteViewByCompanyId(req);
        });

        //****************** PARA ROLES ***********************/
        this.on('GetAllRoles', async (req) => {
            return await GetAllRoles(req);
        });

        this.on('getRoleWithUsers', async (req) => {
            return await getRoleWithUsers(req);
        });
        
        this.on('CreateRole', async (req) => {
            return await CreateRoleService(req);
          });

        this.on('UpdateRolByRoleID', async (req) => {
            return await UpdateRolByRoleID(req);
        });

        //Delete logico de roles
        this.on('DeleteRoleLogical', async (req) => {
        return await DeleteRoleLogical(req);
        });

        //Delete fisico de roles
        this.on('DeleteRoleById', async (req) => {
        return await DeleteRoleById(req);
        });
        
        //****************** PARA ROLES CON USUARIOS ***********************/
        this.on('GetRoleWithUsers', async (req) => {
            const { roleid } = req.data;
            return await getRoleWithUsers(roleid);
        });
        
        return super.init();
    }
};