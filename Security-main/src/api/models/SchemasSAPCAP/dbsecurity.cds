namespace dbsecurity;

//********************************** CATALOGOS **********************/
entity Catalogos {
    key ID                      : UUID;
        COMPANYID               : String;
        CEDIID                  : String;
        LABELID                 : String;
        LABEL                   : String;
        INDEX                   : String;
        COLLECTION              : String;
        SECTION                 : String;
        SEQUENCE                : Integer;
        IMAGE                   : String;
        DESCRIPTION             : String;

        DETAIL_ROW : {
            ACTIVED            : Boolean default true;
            DELETED            : Boolean default false;

            DETAIL_ROW_REG     : Composition of many CatalogoDetalleReg;
        };

        createdAt               : Timestamp;
        updatedAt               : Timestamp;
}

entity CatalogoDetalleReg {
    CURRENT                    : Boolean default true;
    REGDATE                   : Timestamp;
    REGTIME                   : Timestamp;
    REGUSER                   : String;
}

//********************************** PROCESOS **********************/
entity Procesos {
    key ID             : UUID;
        COMPANYID      : Integer;
        CEDIID         : Integer;
        LABELID        : String;
        VALUEPAID      : String;
        VALUEID        : String;
        VALUE          : String;
        ALIAS          : String;
        SEQUENCE       : Integer;
        IMAGE          : String;
        VALUESAPID     : String;
        DESCRIPTION    : String;

        createdAt      : Timestamp;
        updatedAt      : Timestamp;
}

//********************************** USUARIOS **********************/
entity Usuarios {
    key ID               : UUID;
        USERID           : String;
        PASSWORD         : String;
        USERNAME         : String;
        ALIAS            : String;
        FIRSTNAME        : String;
        LASTNAME         : String;
        BIRTHDAYDATE     : String;

        COMPANYID        : Integer;
        COMPANYNAME      : String;
        COMPANYALIAS     : String;
        CEDIID           : String;
        EMPLOYEEID       : String;
        EMAIL            : String;
        PHONENUMBER      : String;
        EXTENSION        : String;
        DEPARTMENT       : String;
        FUNCTION         : String;
        STREET           : String;
        POSTALCODE       : Integer;
        CITY             : String;
        REGION           : String;
        STATE            : String;
        COUNTRY          : String;
        AVATAR           : String;

        ROLES            : Composition of many Roles;
        DETAIL_ROW       : Composition of Detalle;

        createdAt        : Timestamp;
        updatedAt        : Timestamp;
}

entity Roles {
    ROLEID        : String;
    ROLEIDSAP     : String;
    ROLENAME      : String;
    DESCRIPTION   : String;

    PROCESSES     : Composition of many ProcesosUsuario;
    DETAIL_ROW    : Composition of Detalle;
}

entity ProcesosUsuario {
    PROCESSID        : String;
    PROCESSNAME      : String;
    APPLICATIONID    : String;
    APLICATIONNAME   : String;
    VIEWID           : String;
    VIEWNAME         : String;

    PRIVILEGES       : Composition of many Privilegios;
}

entity Privilegios {
    PRIVILEGEID      : String;
    PRIVILEGENAME    : String;
}

entity Detalle {
    ACTIVED          : Boolean default true;
    DELETED          : Boolean default false;

    DETAIL_ROW_REG   : Composition of many DetalleRegistro;
}

entity DetalleRegistro {
    CURRENT          : Boolean default true;
    REGDATE          : Timestamp;
    REGTIME          : Timestamp;
    REGUSER          : String;
}

//********************************** VISTAS (VIEWS) **********************/
entity Views {
    key ID             : UUID;
        COMPANYID      : Integer;
        CEDIID         : Integer;
        LABELID        : String;
        VALUEPAID      : String;
        VALUEID        : String;
        VALUE          : String;
        ALIAS          : String;
        SEQUENCE       : Integer;
        IMAGE          : String;
        VALUESAPID     : String;
        DESCRIPTION    : String;
        ROUTE          : String;

        createdAt      : Timestamp;
        updatedAt      : Timestamp;
}




