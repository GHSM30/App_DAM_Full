using {dbsecurity as security} from '../models/SchemasSAPCAP/dbsecurity';

@impl: 'src/api/controllers/dbsecurity.controller.js'

service inversionsRoute @(path: '/api/inv') {
    entity catalogs        as projection on security.Catalogos;
    entity process         as projection on security.Procesos;
    entity users           as projection on security.Usuarios;
    entity views           as projection on security.Views;
    entity roles           as projection on security.Roles;

    //******************* CATALOGS ***********************************
    @Core.Description: 'get-all-catalogs'
    @path            : 'GetAllCatalogs'
    function GetAllCatalogs()   returns array of catalogs;

    @Core.Description: 'deleted-by-id-catalogs'
    @path            : 'CatalogosDeleteById'
    action CatalogosDeleteById(ValueId : String)   returns Boolean ;

    @Core.Description: 'deletedLogical-by-ValueId-catalogs'
    @path            : 'DeleteCatalogoLogical'
    action DeleteCatalogoLogical(
        ValueId    : String, 
        activated : Boolean
    ) returns Boolean ;

    @Core.Description: 'get-catalogs-by-application-id'
    @path            : 'GetCatalogsByApplicationId'
    function GetCatalogsByApplicationId(LABELID: String) returns array of catalogs;

    @Core.Description: 'get-catalogs-by-valueid'
    @path            : 'GetCatalogsByValueId'
    function GetCatalogsByValueId(ValueId: String) returns array of catalogs;

    @Core.Description: 'get-one-catalogs-by-valueid'
    @path            : 'GetCatalogOne'
    function GetCatalogOne(VALUEID: String) returns array of catalogs;
    
    @Core.Description: 'Actualizar catálogo por VALUEID'
    @path: 'UpdateCatalogByValueId'
    action UpdateCatalogByValueId(
    VALUEID: String,
    LABEL: String,
    INDEX: String,
    COLLECTION: String,
    SECTION: String,
    SEQUENCE: Integer,
    IMAGE: String,
    DESCRIPTION: String,
    REGUSER: String
    ) returns {
    success: Boolean;
    message: String;
    };

    @Core.Description: 'crear-catalogo'
    @path: 'CreateCatalog'
    action CreateCatalog(
    VALUEID: String,
    LABEL: String,
    INDEX: String,
    COLLECTION: String,
    SECTION: String,
    SEQUENCE: Integer,
    IMAGE: String,
    DESCRIPTION: String,
    REGUSER: String
) returns {
    success: Boolean;
    message: String;
};

    //******************* PROCESS ***********************************
    @Core.Description: 'get-all-process'
    @path            : 'GetAllProcess'
    function GetAllProcess()   returns array of process;


    @Core.Description: 'crear-nuevo-proceso'
    @path            : 'CreateProcess'
    action CreateProcess(
    COMPANYID: Integer,
    CEDIID: Integer,
    LABELID: String,
    VALUEPAID: String,
    VALUEID: String,
    VALUE: String,
    ALIAS: String,
    SEQUENCE: Integer,
    IMAGE: String,
    VALUESAPID: String,
    DESCRIPTION: String
) returns {
    success: Boolean;
    message: String;
};


    @Core.Description: 'update-process-by-label-id'
    @path: 'UpdateProcesByLABELId'
    action UpdateProcesByLABELId(
        COMPANYID: Integer,
        CEDIID: Integer,
        LABELID: String,
        VALUEPAID: String,
        VALUEID: String,
        VALUE: String,
        ALIAS: String,
        SEQUENCE: Integer,
        IMAGE: String,
        VALUESAPID: String,
        DESCRIPTION: String
    ) returns Boolean;

    @Core.Description: 'Delete-Process-By-LABEL-Id'
    @path: 'DeleteProcessByLABELId'
    action DeleteProcessByLABELId( LABELID: String) returns Boolean;  

    //******************* USERS ***********************************
    @Core.Description: 'get-all-users'
    @path            : 'GetAllUsers'
    function GetAllUsers()   returns array of users;

    @Core.Description: 'get-one-user-by-id'
    @path            : 'getOneUserById'
    function getOneUserById(USERID: String)   returns array of users;
    
    @Core.Description: 'crear-usuario-nuevo'
    @path            : 'CreateUser'
    action CreateUser(user: users) returns Boolean;

    @Core.Description: 'actualizar-usuario'
    @path            : 'UpdateUserByUSERID'
    action UpdateUserByUSERID(
        USERID:     String,
        PASSWORD:   String,
        USERNAME:   String,
        ALIAS:      String,
        FIRSTNAME:  String,
        LASTNAME:   String,
        BIRTHDAYDATE: String,
        COMPANYID:  Integer,
        COMPANYNAME: String,
        COMPANYALIAS: String,
        CEDIID:     String,
        EMPLOYEEID: String,
        EMAIL:      String,
        PHONENUMBER: String,
        EXTENSION:  String,
        DEPARTMENT: String,
        FUNCTION:   String,
        STREET:     String,
        POSTALCODE: Integer,
        CITY:       String,
        REGION:     String,
        STATE:      String,
        COUNTRY:    String,
        AVATAR:     String,
        ROLES: array of RolesInput
    ) returns Boolean;

    @Core.Description: 'logical-delete-user'
    @path: 'DeleteUserLogical'
    action DeleteUserLogical(USERID: String, ACTIVED: Boolean) returns Boolean;

    @Core.Description: 'physical-delete-user'
    @path: 'DeleteUserPhysical'
    action DeleteUserPhysical(USERID: String) returns Boolean;


    //******************* VIEWS ***********************************
    @Core.Description: 'get-all-views'
    @path            : 'GetAllViews'
    function GetAllViews()   returns array of views;


    @Core.Description: 'crear-nueva-vista'
    @path            : 'CreateView'
    action CreateView(
        COMPANYID: Integer,
        CEDIID: Integer,
        LABELID: String,
        VALUEPAID: String,
        VALUEID: String,
        VALUE: String,
        ALIAS: String,
        SEQUENCE: Integer,
        IMAGE: String,
        VALUESAPID: String,
        DESCRIPTION: String,
        ROUTE: String
    ) returns {
        success: Boolean;
        message: String;
    };


    @Core.Description: 'update-view-by-company-id'
    @path: 'UpdateViewByCompanyId'
    action UpdateViewByCompanyId(
        COMPANYID: Integer,
        CEDIID: Integer,
        LABELID: String,
        VALUEPAID: String,
        VALUEID: String,
        VALUE: String,
        ALIAS: String,
        SEQUENCE: Integer,
        IMAGE: String,
        VALUESAPID: String,
        DESCRIPTION: String,
        ROUTE: String
    ) returns Boolean;

    //Delete de views por id
    @Core.Description: 'delete-view-by-companyid'
    @path: 'DeleteViewByCompanyId'
    action DeleteViewByCompanyId(
    COMPANYID : Integer    // El COMPANYID de la vista a eliminar
    ) returns views;

    //******************* ROLES ***********************************
    @Core.Description: 'get-all-Roles'
    @path            : 'GetAllRoles'
    function GetAllRoles()   returns array of roles;

    @Core.Description: 'get-role-with-users-by-roleid'
    @path            : 'getRoleWithUsers'
    function getRoleWithUsers(roleid: String) returns roles;

@Core.Description: 'crear-rol-con-validacion'
@path: 'CreateRole'
action CreateRole(
  ROLEID: String,
  ROLENAME: String,
  DESCRIPTION: String,
  PROCESSES: array of {
    PROCESSID: String;
    PROCESSNAME: String;
    APPLICATIONID: String;
    APPLICATIONNAME: String;
    VIEWID: String;
    VIEWNAME: String;
    PRIVILEGES: array of {
      PRIVILEGEID: String;
      PRIVILEGENAME: String;
    };
  },
  DETAIL_ROW: {
    ACTIVED: Boolean;
    DELETED: Boolean;
    DETAIL_ROW_REG: array of {
      CURRENT: Boolean;
      REGDATE: DateTime;
      REGTIME: DateTime;
      REGUSER: String;
    };
  }
) returns {
  success: Boolean;
  message: String;
};



    @Core.Description: 'put-role-with-users-by-roleid'
    @path            : 'UpdateRolByRoleID'
    action UpdateRolByRoleID(
        ROLEID: String,
        ROLENAME: String,
        DESCRIPTION: String,
        PROCESSES: array of ProcessInput
        ) returns Boolean;

    //Delete logico rol
    @Core.Description: 'delete-role-logical'
    @path: 'DeleteRoleLogical'
    action DeleteRoleLogical(
        roleid    : String
    ) returns roles;
    //Delete fisico rol
    @Core.Description: 'delete-role-by-id'
    @path: 'DeleteRoleById'
    action DeleteRoleById(
        roleid : String
    ) returns roles; 



}

type RolesInput:{
    ROLEID: String;
    ROLENAME: String;
    DESCRIPTION: String;
    ROLEIDSAP: String;
    PROCESSES: array of ProcessInput;
}

type ProcessInput: {
  PROCESSID: String;
  PROCESSNAME: String;
  VIEWID: String ;
  VIEWNAME: String;
  APPLICATIONID: String; 
  APPLICATIONNAME: String; 
  PRIVILEGES: array of Privilegios;
}

type Privilegios:{
    PRIVILEGEID: String;
    PRIVILEGENAME: String;
}