import React, {useMemo} from "react";
import {
    Box,
    IconButton,
    Typography,
    Toolbar, Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, styled, useTheme,
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import AddIcon from '@mui/icons-material/Add';
import Project from "./entity/Project";

const drawerWidth = 240;


interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

type Props = {
    projectId: string;
    projects: Project[];
}
export default function ProjectBarContainer(props: Props) {
    const theme = useTheme();

    const [open, setOpen] = React.useState(false);

    const { projectId, projects } = props;

    const project = useMemo(() => projects.find((project) => project.projectId === projectId), [projectId]);

    if (!project) throw new Error(`ProjectBarContainer -> there's no project with project id: ${projectId}`);


    const toggleDrawer = () => {
        setOpen(open => !open);
    };


    return (
        <Box sx={{display: 'flex'}}>
            <AppBar position="relative" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{mr: 2, ...(open && {display: 'none'})}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {project.title}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={toggleDrawer}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                    </IconButton>
                </DrawerHeader>
                <Divider/>
                <List>
                    {projects.map((project, index) => (
                        <ListItem button key={project.projectId}>
                            <ListItemIcon>
                                <InboxIcon/>
                            </ListItemIcon>
                            <ListItemText primary={project.title}/>
                        </ListItem>
                    ))}
                    <ListItem button key={'addProject'}>
                        <ListItemIcon><AddIcon/></ListItemIcon>
                        <ListItemText primary={'Add project'}/>
                    </ListItem>
                </List>
                <Divider/>
                <List>
                    {['Trash', 'preferences'].map((text) => (
                        <ListItem button key={text}>
                            <ListItemText primary={text}/>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
}
