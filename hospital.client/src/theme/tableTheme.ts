import { createTheme } from "react-data-table-component";

// Light theme
createTheme(
  "heroui-theme",
  {
    text: {
      primary: "hsl(var(--heroui-foreground))",
      secondary: "hsl(var(--heroui-foreground-500))",
    },
    background: {
      default: "hsl(var(--heroui-content1))",
    },
    context: {
      background: "hsl(var(--heroui-primary))",
      text: "hsl(var(--heroui-primary-foreground))",
    },
    divider: {
      default: "hsl(var(--heroui-divider))",
    },
    button: {
      default: "hsl(var(--heroui-foreground-500))",
      hover: "hsl(var(--heroui-foreground))",
      focus: "hsl(var(--heroui-primary))",
      disabled: "hsl(var(--heroui-foreground-300))",
    },
    sortFocus: {
      default: "hsl(var(--heroui-primary))",
    },
  },
  "default",
);

// Dark theme
createTheme(
  "heroui-theme-dark",
  {
    text: {
      primary: "#E4E4E7",
      secondary: "#A1A1AA",
    },
    background: {
      default: "hsl(var(--heroui-content1))",
    },
    context: {
      background: "hsl(var(--heroui-primary))",
      text: "hsl(var(--heroui-primary-foreground))",
    },
    divider: {
      default: "hsl(var(--heroui-divider))",
    },
    button: {
      default: "#A1A1AA",
      hover: "#E4E4E7",
      focus: "#3B82F6",
      disabled: "hsl(var(--heroui-foreground-300))",
    },
    sortFocus: {
      default: "#3B82F6",
    },
  },
  "default",
);

export const customStyles = {
  header: {
    style: {
      backgroundColor: "transparent",
      color: "hsl(var(--heroui-foreground))",
      fontWeight: "bold",
      fontSize: "1.5rem",
      justifyContent: "flex-start",
      paddingLeft: "1rem",
    },
  },
  subHeader: {
    style: {
      backgroundColor: "transparent",
      color: "hsl(var(--heroui-foreground))",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  headRow: {
    style: {
      backgroundColor: "rgba(10, 79, 166, 0.08)",
      color: "hsl(var(--heroui-foreground))",
      borderTopWidth: "0px",
      borderBottomWidth: "1px",
      borderBottomColor: "hsl(var(--heroui-divider))",
      borderTopLeftRadius: "0.75rem",
      borderTopRightRadius: "0.75rem",
    },
  },
  headCells: {
    style: {
      fontSize: "0.875rem",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.025em",
      color: "#0A4FA6",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  cells: {
    style: {
      color: "hsl(var(--heroui-foreground))",
      fontSize: "0.875rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  rows: {
    stripedStyle: {
      backgroundColor: "rgba(10, 79, 166, 0.03)",
      color: "hsl(var(--heroui-foreground))",
    },
    style: {
      backgroundColor: "hsl(var(--heroui-content1))",
      color: "hsl(var(--heroui-foreground))",
      "&:not(:last-of-type)": {
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
        borderBottomColor: "hsl(var(--heroui-divider))",
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "hsl(var(--heroui-default-100))",
      color: "hsl(var(--heroui-foreground))",
      borderLeft: "3px solid #0A4FA6",
      transitionDuration: "0.15s",
      transitionProperty: "background-color, border-left",
      outline: "none",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid hsl(var(--heroui-divider))",
      backgroundColor: "hsl(var(--heroui-content1))",
      color: "hsl(var(--heroui-foreground))",
      borderBottomLeftRadius: "0.75rem",
      borderBottomRightRadius: "0.75rem",
    },
    pageButtonsStyle: {
      borderRadius: "0.5rem",
      height: "40px",
      width: "40px",
      padding: "8px",
      margin: "0 4px",
      cursor: "pointer",
      transition: "0.4s",
      color: "hsl(var(--heroui-foreground-500))",
      fill: "hsl(var(--heroui-foreground-500))",
      backgroundColor: "transparent",
      "&:disabled": {
        cursor: "unset",
        color: "hsl(var(--heroui-foreground-300))",
        fill: "hsl(var(--heroui-foreground-300))",
      },
      "&:hover:not(:disabled)": {
        backgroundColor: "rgba(10, 79, 166, 0.10)",
        color: "#0A4FA6",
      },
      "&:focus": {
        outline: "none",
        backgroundColor: "rgba(10, 79, 166, 0.10)",
        color: "#0A4FA6",
      },
    },
  },
  noData: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "hsl(var(--heroui-content1))",
      color: "hsl(var(--heroui-foreground-400))",
      padding: "2rem",
    },
  },
  progress: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "hsl(var(--heroui-content1))",
      color: "hsl(var(--heroui-foreground-500))",
      padding: "2rem",
    },
  },
};

export const customStylesDark = {
  ...customStyles,
  headRow: {
    style: {
      ...customStyles.headRow.style,
      backgroundColor: "rgba(10, 79, 166, 0.15)",
    },
  },
  headCells: {
    style: {
      ...customStyles.headCells.style,
      color: "#93C5FD",
    },
  },
  rows: {
    ...customStyles.rows,
    stripedStyle: {
      backgroundColor: "rgba(10, 79, 166, 0.06)",
      color: "hsl(var(--heroui-foreground))",
    },
    highlightOnHoverStyle: {
      ...customStyles.rows.highlightOnHoverStyle,
      borderLeft: "3px solid #3B82F6",
    },
  },
  pagination: {
    ...customStyles.pagination,
    pageButtonsStyle: {
      ...customStyles.pagination.pageButtonsStyle,
      "&:hover:not(:disabled)": {
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        color: "#93C5FD",
      },
      "&:focus": {
        outline: "none",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        color: "#93C5FD",
      },
    },
  },
};
