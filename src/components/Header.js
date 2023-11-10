import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { Typography, ThemeProvider} from "@mui/material";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { BiCopy, BiLinkExternal , BiLogOut,BiLogOutCircle} from "react-icons/bi";
import CircularProgress from '@mui/material/CircularProgress';
import Pompiere from "./Pompiere-Regular.ttf"


const theme = createTheme({
  typography: {
    fontFamily: 'Pompiere',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Pompiere';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: local('Pompiere'), local('Pompiere-Regular'), url(${Pompiere}) format('ttf');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
      `,
    },
  },
});



class Header extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      anchorEl : false,
    };
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleMenuClose = this.handleMenuClose.bind(this);

  }




  copyAddress (){
    navigator.clipboard.writeText(this.props.linkedAccount)
  }

  goToLink(){
    window.open("https://etherscan.io/address/" + this.props.linkedAccount,"_blank")
  }

  handleMenuClick = (event)=>{
    this.setState({
      anchorEl: event.currentTarget,
    });
  }

  handleMenuClose = (event)=>{
    this.setState({
      anchorEl: null,
    });
  }

  render() {
    return (
      <Box sx={{ flexGrow: 1, px: 2 }}>
        <AppBar
          position="static"
          sx={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              pl: "0px !important",
              pr: "0px !important",
              flexDirection: {
                md: 'row',
                xs: 'column',
              },
              alignItems: {
                md: 'center',
                xs: 'flex-start'
              }
            }}
          >
            <IconButton color="inherit" sx={{ px: 0 }}>
            <ThemeProvider theme={theme}>
              <Typography variant="h3" sx={{ mb: 1.5,    marginTop: "0px",  fontFamily : "Pompiere",
                marginLeft: "20px"
            } }>FREDDIES'S CREW</Typography>
            </ThemeProvider>
            </IconButton>
            
            <IconButton
              size="normal"
              color="inherit"
              sx={{
                border: "1px solid #3E4269",
                borderRadius: "10px",
                backgroundColor: "transparent",
                display:this.props.linkedAccount === ""? "flex":"none",
              }}
              onClick={()=>{this.props.walletConnect()}}
            >
              <AccountBalanceWalletOutlinedIcon sx={{ color: "#fff"}} /> 
              <Typography sx={{ color: "#fff" , fontFamily : "Pompiere"}}> &nbsp; WALLET CONNECT</Typography>
            </IconButton>

            <Button
              id="basic-button"
              aria-controls={Boolean(this.state.anchorEl) ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(this.state.anchorEl) ? 'true' : undefined}
              onClick={this.handleMenuClick}
              sx={{
                border: "1px solid #3E4269",
                borderRadius: "10px",
                backgroundColor: "transparent",
                color : '#fff',
                display:this.props.linkedAccount === ""? "none":"flex",
              }}
            >
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: "25px" }}/>
                <Typography sx={{ml:2, textTransform: 'initial'}}>{this.props.linkedAccount.slice(0, 7)}...{this.props.linkedAccount.slice(35, 42)} </Typography>
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={this.state.anchorEl}
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              sx={{
                '& .MuiPaper-root': {
                  width: 214,
                  bgcolor: '#050819',
                  borderRadius: "10px",
                  border: 'solid 1px #3E4269',
                  color: '#fff',
                }
              }}
            >
              <MenuItem onClick = {()=> {this.copyAddress()}}><BiCopy/> &nbsp; Copy Address</MenuItem>
              <MenuItem onClick=  {()=> {this.goToLink()}}><BiLinkExternal/> &nbsp; View in Explorer</MenuItem>
              <MenuItem onClick=  {()=>{this.props.walletDisconnect();this.setState({ anchorEl: null});}}><BiLogOut/> &nbsp; Disconnect</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </Box>
    );
  }
}
export default Header;
