import { Box } from '@mui/system';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';


export default function AdminDashboard(){

  const theme = useTheme();
  let useStyles = makeStyles(()=>({
    container:{
      [theme.breakpoints.down("sm")]:{
        height:"100vh",
      },
      [theme.breakpoints.down("xl")]:{
        height:"84vh",
      },
      [theme.breakpoints.up("xl")]:{
        height:"87vh",
      }
    }
  }))

  const styles = useStyles()
  return(
    <>
      <Box style={{width:"100%",paddingTop:"30px"}} className={styles.container}>
        <iframe title="SIA Observability" style={{width:"100%",height:"100%"}} src="https://app.powerbi.com/view?r=eyJrIjoiMWZlODRjNmItZDY5NS00YjY3LWI4ZGItMjIxMWI4MWUxOTQ0IiwidCI6ImEwMDU2NDczLTFhYzctNDU1OC05YzYwLTIzOTlkZmNjYjA2NiJ9" frameBorder="0" allowFullScreen="true"></iframe>
      </Box>
    </>
  )
}
