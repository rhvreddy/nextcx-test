import { Divider, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function BaseModelComponent(props){
  const theme = useTheme();
  const {config} = props;
  return(
    <>
      <Grid container style={{display:"flex",flexDirection:"column",rowGap:"5px",width:"400px",border:"1px solid #aaa",borderRadius:"10px",padding:"10px"}}>
        <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
          <Typography style={{fontWeight:"600",fontSize:"18px",color:theme.palette.primary.main}}>
            {config?.name}
          </Typography>
          <Typography style={{fontStyle:"italic"}}>
            {config?.version}
          </Typography>
        </Grid>
        <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
          {config?.tags.map((tag,i)=>{
            return (config?.tags.length-1 === i?<Typography>{tag}</Typography>:<Typography>{tag+" | "}</Typography>)
          })}
        </Grid>
        <Divider style={{width:"100%"}} />
        <Grid item style={{width:"100%",minHeight:"130px",maxHeight:"max-content",textOverflow:"ellipsis",overflowY:"hidden"}}>
          <Typography style={{fontWeight:"900",marginTop:"5px"}}>Description</Typography>
          <Typography title={config?.description}>{config?.description}</Typography>
        </Grid>
        <Grid item style={{marginTop:"5px"}}>
          <Typography style={{fontWeight:"900",marginTop:"5px"}}>Model Attributes:</Typography>
          <Grid item style={{display:"flex",columnGap:"5px",alignItems:"center"}}>
            {config?.attributes.map((attribute,i)=>{
              return (config?.attributes.length-1 === i?<Typography>{attribute}</Typography>:<Typography>{attribute+" , "}</Typography>)
            })}
          </Grid>
        </Grid>
        <Grid item style={{marginTop:"5px"}}>
          <Typography style={{fontWeight:"900",marginTop:"5px"}}>Model Id:</Typography>
          <Typography >{config?.modelId} </Typography>
        </Grid>
        <Grid item style={{marginTop:"5px"}}>
          <Typography style={{fontWeight:"900",marginTop:"5px"}}>Release Date:</Typography>
          <Typography >{config?.releaseDate}</Typography>
        </Grid>
      </Grid>
    </>
  )
}
