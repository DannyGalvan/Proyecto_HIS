namespace Hospital.Server.Utils
{
    using Hospital.Server.Entities.Interfaces;
    using System.Reflection;

    public static class AuditHelper
    {
        public static void SetCreatedByRecursive(object obj, long userId)
        {
            // Usamos un HashSet para rastrear objetos ya procesados y evitar bucles infinitos
            SetCreatedByRecursiveInternal(obj, userId, new HashSet<object>());
        }

        private static void SetCreatedByRecursiveInternal(object obj, long userId, HashSet<object> visited)
        {
            if (obj == null || visited.Contains(obj)) return;

            var type = obj.GetType();

            // No entramos en tipos simples (strings, números, fechas, etc.)
            if (type.IsPrimitive || type == typeof(string) || type == typeof(decimal) || type == typeof(DateTime))
                return;

            visited.Add(obj);

            // 1. Asignar el valor si implementa la interfaz
            if (ImplementsIRequest(type))
            {
                var createdByProp = type.GetProperty("CreatedBy");
                if (createdByProp?.CanWrite == true)
                {
                    createdByProp.SetValue(obj, userId);
                }
            }

            // 2. Recorrer propiedades
            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (prop.GetIndexParameters().Length > 0) continue;

                // Evitar procesar tipos que sabemos que no tienen sentido auditar (System namespace)
                if (prop.PropertyType.Namespace?.StartsWith("System") == true &&
                    !typeof(System.Collections.IEnumerable).IsAssignableFrom(prop.PropertyType))
                    continue;

                var value = prop.GetValue(obj);
                if (value == null) continue;

                if (value is System.Collections.IEnumerable collection && !(value is string))
                {
                    foreach (var item in collection)
                    {
                        if (item != null)
                            SetCreatedByRecursiveInternal(item, userId, visited);
                    }
                }
                else
                {
                    SetCreatedByRecursiveInternal(value, userId, visited);
                }
            }
        }


        public static void SetUpdatedByRecursive(object? obj, long userId)
        {
            if (obj == null) return;

            var type = obj.GetType();

            if (ImplementsIRequest(type))
            {
                var createdByProp = type.GetProperty("UpdatedBy");
                if (createdByProp?.CanWrite == true)
                {
                    createdByProp.SetValue(obj, userId);
                }
            }

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                // 🚫 Saltar propiedades indexadas
                if (prop.GetIndexParameters().Length > 0)
                    continue;

                var value = prop.GetValue(obj);
                if (value == null) continue;

                if (value is IEnumerable<object> collection)
                {
                    foreach (var item in collection)
                    {
                        if (item != null)
                            SetUpdatedByRecursive(item, userId);
                    }
                }
                else
                {
                    SetUpdatedByRecursive(value, userId);
                }
            }
        }

        private static bool ImplementsIRequest(Type type)
        {
            return type.GetInterfaces().Any(i =>
                i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IRequest<>));
        }
    }

}