export const RolUsuario = {
        Todos                     : 0,
        //------------------------------
        CrearOrdenesYDetalles     : 1,
        //------------------------------
        GestionarUsuarios         : 2,
        //------------------------------
        ModificarOrdenesYDetalles : 4,
        //------------------------------
        GestionarPagos            : 8,
        //-------------------------------
        GestionarPacientes        : 16,
        //-------------------------------
        GestionarExamenes         : 32,
        //-------------------------------
        Totalizar                 : 64,
        //-------------------------------
        VerReportesAntiguos       : 128,
        //-------------------------------
        GestionarPresupuestos     : 256,
        //-------------------------------
        Ninguno                   : 512,


}as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

export type Rol = {
        Id   : number;
        Name : string;
        Permisos : RolUsuario[];
}

