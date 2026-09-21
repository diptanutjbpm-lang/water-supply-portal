import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#10345f', dark: '#0b2a4d' },
    secondary: { main: '#1768ac' },
    success: { main: '#17844d' },
    error: { main: '#c7362f' },
    warning: { main: '#b86b00' },
    background: { default: '#eef3f7', paper: '#ffffff' },
    text: { primary: '#1f2d3d', secondary: '#687789' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, "Noto Sans", Roboto, Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { minHeight: 44 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
  },
})

export default theme
