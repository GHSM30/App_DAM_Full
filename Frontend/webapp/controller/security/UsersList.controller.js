/* eslint-disable valid-jsdoc */
/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable fiori-custom/sap-no-hardcoded-url */
/* eslint-disable fiori-custom/sap-no-localhost */
sap.ui.define([
    "com/invertions/sapfiorimodinv/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, Log, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.invertions.sapfiorimodinv.controller.security.UsersList", {
        onInit: function () {

            // Esto desactiva los botones cuando entras a la vista, hasta que selecciones un usuario en la tabla se activan
            var oViewModel = new JSONModel({
                buttonsEnabled: false
            });
            this.getView().setModel(oViewModel, "viewModel");
            //

            // Carga los usuarios
            this.loadUsers();
        },

        /**
         * Funcion para cargar la lista de usuarios.
         */
        loadUsers: function () {
            var oTable = this.byId("IdTable1UsersManageTable");
            var oModel = new JSONModel();
            var that = this;

            // En nuestro proyecto nosotros creamos un archivo llamado en.json para cargar la url de las apis
            // Cambiar esto segun su backend
            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_USERS_URL_BASE + "GetAllUsers"))
                .then(res => res.json())
                .then(data => {
                    data.value.forEach(user => {
                        user.ROLES = that.formatRoles(user.ROLES);
                    });
                    oModel.setData(data);
                    oTable.setModel(oModel);
                })
                .catch(err => {
                    if (err.message === ("Cannot read properties of undefined (reading 'setModel')")) {
                        return;
                    } else {
                        MessageToast.show("Error al cargar usuarios: " + err.message);
                    }
                });
        },

        loadCompanies: function () {
            //Agregar lógica para cargar compañias
            var oView = this.getView();
            var oCompaniesModel = new JSONModel();

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_COMPANIES_URL_BASE + "GetPricesHistoryBySymbol"))
                .then(res => res.json())
                .then(data => {
                    oCompaniesModel.setData({ companies: data.value });
                    oView.setModel(oCompaniesModel, "companiesModel");
                })
                .catch(err => {
                    MessageToast.show("Error al cargar compañías: " + err.message);
                });
        },

        loadDeptos: function (companyId) {
            //Agregar lógica para cargar deptos según la compañía
            var oView = this.getView();
            var oDeptosModel = new JSONModel();

            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_DEPARTMENTS_URL_BASE + "bycompany" + companyId))
                .then(res => res.json())
                .then(data => {
                    oDeptosModel.setData({ departments: data.value });
                    oView.setModel(oDeptosModel, "deptosModel");
                })
                .catch(err => {
                    MessageToast.show("Error al cargar departamentos: " + err.message);
                });
        },


        /**
         * Funcion para cargar la lista de roles y poderlos visualizar en el combobox
         * Esto va cambiar ya que quiere que primero carguemos las compañías, luego que carguemos los deptos
         * Y en base a las compañías y depto que coloquemos, se muestren los roles que pertenecen a esta compañía y depto.
         */
        loadRoles: function () {
            var oView = this.getView();
            var oRolesModel = new JSONModel();

            // En nuestro proyecto nosotros creamos un archivo llamado en.json para cargar la url de las apis
            // Cambiar esto segun su backend
            fetch("env.json")
                .then(res => res.json())
                .then(env => fetch(env.API_ROLES_URL_BASE + "GetAllRoles"))
                .then(res => res.json())
                .then(data => {
                    oRolesModel.setData({ roles: data.value });
                    oView.setModel(oRolesModel);
                })
                .catch(err => MessageToast.show("Error al cargar roles: " + err.message));
        },


        /**
         * Esto es para formatear los roles al cargarlos de la bd y que aparezcan separados por un guion medio en la tabla.
         * Ejemplo: Usuario auxiliar-Investor-etc...
         */
        formatRoles: function (rolesArray) {
            return Array.isArray(rolesArray)
                ? rolesArray.map(role => role.ROLENAME).join("-")
                : "";
        },

        /**
         * Este evento se encarga de crear los items en el VBox con el nombre de los roles que se vayan agregando.
         */
        onRoleSelected: function (oEvent) {
            var oComboBox = oEvent.getSource();
            var sSelectedKey = oComboBox.getSelectedKey();
            var sSelectedText = oComboBox.getSelectedItem().getText();

            var oVBox;
            // Este if valida si es la modal de add user o edit user en la que se estáran colocando los roles
            if (oComboBox.getId().includes("comboBoxEditRoles")) {
                oVBox = this.getView().byId("selectedEditRolesVBox");  // Update User VBox
            } else {
                oVBox = this.getView().byId("selectedRolesVBox");   // Create User VBox
            }
            // Validar duplicados
            var bExists = oVBox.getItems().some(oItem => oItem.data("roleId") === sSelectedKey);
            if (bExists) {
                MessageToast.show("El rol ya ha sido añadido.");
                return;
            }

            // Crear item visual del rol seleccionado
            var oHBox = new sap.m.HBox({
                items: [
                    new sap.m.Label({ text: sSelectedText }).addStyleClass("sapUiSmallMarginEnd"),
                    // @ts-ignore
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        type: "Transparent",
                        press: () => oVBox.removeItem(oHBox)
                    })
                ]
            });

            oHBox.data("roleId", sSelectedKey);
            oVBox.addItem(oHBox);
        },

        //===================================================
        //=============== AÑADIR USUARIO ====================
        //===================================================

        /**
         * Función onpress del botón para agregar un nuevo usuario
         */
        onAddUser: function () {
            var oView = this.getView();

            if (!this._oCreateUserDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.invertions.sapfiorimodinv.view.security.fragments.AddUserDialog",
                    controller: this
                }).then(oDialog => {
                    this._oCreateUserDialog = oDialog;
                    oView.addDependent(oDialog);
                    this.loadRoles();
                    this._oCreateUserDialog.open();
                });
            } else {
                this._oCreateUserDialog.open();
            }

        },

        onSaveUser: async function () {
            //Aquí la lógica para agregar el usuario
            try {
                const oView = this.getView();

                const sUserId = Fragment.byId(oView.getId(), "inputUserId")?.getValue();
                const sUsername = Fragment.byId(oView.getId(), "inputUsername")?.getValue();
                const sPhone = Fragment.byId(oView.getId(), "inputUserPhoneNumber")?.getValue();
                const sEmail = Fragment.byId(oView.getId(), "inputUserEmail")?.getValue();
                const sBirthday = Fragment.byId(oView.getId(), "inputUserBirthdayDate")?.getDateValue();
                const sFunction = Fragment.byId(oView.getId(), "inputUserFunction")?.getValue();

                const aRoles = this._extractRolesFromVBox("selectedRolesVBox");

                // Arma el payload según lo que espera la acción CreateUser
                const oPayload = {
                    USERID: sUserId,
                    USERNAME: sUsername,
                    PHONENUMBER: sPhone,
                    EMAIL: sEmail,
                    BIRTHDAYDATE: sBirthday,
                    FUNCTION: sFunction,
                    ROLES: aRoles
                };

                const env = await (await fetch("env.json")).json();

                const response = await fetch(env.API_CREATE_USER, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user: oPayload })  // ← acción CreateUser espera { user: { ... } }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                MessageToast.show("Usuario creado correctamente");
                this.loadUsers();
                this._oCreateUserDialog.close();

            } catch (err) {
                console.error("Error en onSaveUser:", err);
                MessageToast.show("Error al crear usuario: " + err.message);
            }
        },

        onCancelUser: function () {
            if (this._oCreateUserDialog) {
                this._oCreateUserDialog.close();
            }
        },

        //===================================================
        //=============== EDITAR USUARIO ====================
        //===================================================

        /**
         * Función onpress del botón para editar un nuevo usuario
         * Agregar la lógica para cargar la info a la modal
         */
        onEditUser: function () {
            var oView = this.getView();

            if (!this._oEditUserDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "com.invertions.sapfiorimodinv.view.security.fragments.EditUserDialog",
                    controller: this
                }).then(oDialog => {
                    this._oEditUserDialog = oDialog;
                    oView.addDependent(oDialog);
                    this._oEditUserDialog.open();
                });
            } else {
                this._oEditUserDialog.open();
            }

        },

        onEditSaveUser: async function () {
            //Aquí la lógica para agregar la info actualizada del usuario en la bd
            try {
                const oView = this.getView();
                const oDialog = this._oEditUserDialog;
                const sUsername = Fragment.byId(oView.getId(), "editUsernameInput").getValue();
                const sEmail = Fragment.byId(oView.getId(), "editEmailInput").getValue();
                const sPhone = Fragment.byId(oView.getId(), "editPhoneInput").getValue();
                const aRoles = this._extractRolesFromVBox("selectedEditRolesVBox");

                const oPayload = {
                    USERID: this.selectedUser.USERID,
                    USERNAME: sUsername,
                    EMAIL: sEmail,
                    PHONE: sPhone,
                    ROLES: aRoles
                };

                const env = await (await fetch("env.json")).json();
                await fetch(env.API_USERS_URL_BASE + oPayload.USERID, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(oPayload)
                });

                MessageToast.show("Usuario actualizado");
                this.loadUsers();
                oDialog.close();
            } catch (err) {
                MessageToast.show("Error al editar usuario: " + err.message);
            }
        },

        onEditCancelUser: function () {
            if (this._oEditUserDialog) {
                this._oEditUserDialog.close();
            }
        },


        // ===================================================
        // ========= Eliminar Usuario Fisicamente ============
        // ===================================================

        /**
         * Función onDeleteUser .
         */
        onDeleteUser: function () {
            if (this.selectedUser) {
                var that = this;
                MessageBox.confirm("¿Deseas eliminar el usuario con nombre: " + this.selectedUser.USERNAME + "?", {
                    title: "Confirmar eliminación",
                    icon: MessageBox.Icon.WARNING,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            that.deleteUser(that.selectedUser.USERID);
                        }
                    }
                });
            } else {
                MessageToast.show("Selecciona un usuario para eliminar de la base de datos");
            }
        },

        deleteUser: async function (UserId) {
            try {
                const env = await (await fetch("env.json")).json();
                await fetch(env.API_USERS_URL_BASE + UserId, {
                    method: "DELETE"
                });

                MessageToast.show("Usuario eliminado correctamente");
                this.loadUsers();
            } catch (err) {
                MessageToast.show("Error al eliminar usuario: " + err.message);
            }
        },

        // ===================================================
        // ============ Desactivar el usuario ================
        // ===================================================

        /**
         * Función onDesactivateUser.
         */
        onDesactivateUser: function () {
            if (this.selectedUser) {
                var that = this;
                MessageBox.confirm("¿Deseas desactivar el usuario con nombre: " + this.selectedUser.USERNAME + "?", {
                    title: "Confirmar desactivación",
                    icon: MessageBox.Icon.WARNING,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            that.desactivateUser(that.selectedUser.USERID);
                        }
                    }
                });
            } else {
                MessageToast.show("Selecciona un usuario para desactivar");
            }
        },

        desactivateUser: async function (UserId) {
            //Aquí la lógica para agregar la info actualizada del usuario en la bd

            try {
                const env = await (await fetch("env.json")).json();
                await fetch(env.API_USERS_URL_BASE + UserId + "/deactivate", {
                    method: "POST"
                });

                MessageToast.show("Usuario desactivado");
                this.loadUsers();
            } catch (err) {
                MessageToast.show("Error al desactivar usuario: " + err.message);
            }
        },


        // ===================================================
        // ============== Activar el usuario =================
        // ===================================================

        /**
         * Función onActivateUser.
         */
        onActivateUser: function () {
            if (this.selectedUser) {
                var that = this;
                MessageBox.confirm("¿Deseas activar el usuario con nombre: " + this.selectedUser.USERNAME + "?", {
                    title: "Confirmar activación",
                    icon: MessageBox.Icon.WARNING,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            that.activateUser(that.selectedUser.USERID);
                        }
                    }
                });
            } else {
                MessageToast.show("Selecciona un usuario para activar");
            }
        },

        activateUser: async function (UserId) {
            // Aqui agregar la lógica para activar al usuario
            try {
                const env = await (await fetch("env.json")).json();
                await fetch(env.API_USERS_URL_BASE + UserId + "/activate", {
                    method: "POST"
                });

                MessageToast.show("Usuario activado");
                this.loadUsers();
            } catch (err) {
                MessageToast.show("Error al activar usuario: " + err.message);
            }
        },


        //===================================================
        //=============== Funciones de la tabla =============
        //===================================================

        /**
         * Función que obtiene el usuario que se selecciona en la tabla en this.selectedUser se guarda todo el usuario
         * Además activa los botones de editar/eliminar/desactivar y activar
         */
        onUserRowSelected: function () {
            var oTable = this.byId("IdTable1UsersManageTable");
            var iSelectedIndex = oTable.getSelectedIndex();

            if (iSelectedIndex < 0) {
                this.getView().getModel("viewModel").setProperty("/buttonsEnabled", false);
                return;
            }

            var oContext = oTable.getContextByIndex(iSelectedIndex);
            var UserData = oContext.getObject();

            this.selectedUser = UserData;

            // Activa los botones
            this.getView().getModel("viewModel").setProperty("/buttonsEnabled", true);
        },

        onSearchUser: function (oEvent) {
            //Aplicar el filtro de búsqueda para la tabla
            const sQuery = oEvent.getSource().getValue().toLowerCase();
            const oTable = this.byId("IdTable1UsersManageTable");
            const oBinding = oTable.getBinding("rows");

            oBinding.filter(new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("USERNAME", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("EMAIL", sap.ui.model.FilterOperator.Contains, sQuery)
                ],
                and: false
            }));
        },

        onRefresh: function () {
            this.loadUsers();
        },

        _extractRolesFromVBox: function (vboxId) {
            const oVBox = this.getView().byId(vboxId);
            return oVBox.getItems().map(oItem => {
                return { ROLEID: oItem.data("roleId") };
            });
        },


        //===================================================
        //=========== Validar email y phonenumber ===========
        //===================================================

        isValidEmail: function (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        isValidPhoneNumber: function (phone) {
            return /^\d{10}$/.test(phone); // Ejemplo: 10 dígitos numéricos
        }


    });
});
