import Grid from '@mui/material/Grid';
import './HomePageMainSection.css';;
import HomePageSection2 from './home-page-section2';



const BannerSection = () => {

  return (
    <>
      <Grid container  className="hero-main-section">
        <Grid item xs={12} md={12}>
          <HomePageSection2 />
        </Grid>

      </Grid>
    </>

  );
};

export default BannerSection;

