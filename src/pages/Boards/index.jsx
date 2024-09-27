import { useState, useEffect } from 'react'
import AppBar from '~/components/AppBar/AppBar'
import PageLoadingSpinner from '~/components/Loading/PageLoadingSpinner'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import HomeIcon from '@mui/icons-material/Home'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Pagination from '@mui/material/Pagination'
import PaginationItem from '@mui/material/PaginationItem'
import { Link, useLocation } from 'react-router-dom'
import randomColor from 'randomcolor'
import SidebarCreateBoardModal from './create'
import { fetchBoardsAPI } from '~/apis'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

import { styled } from '@mui/material/styles'
const SidebarItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: '12px 16px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#33485D' : theme.palette.grey[300]
  },
  '&.active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#0c66e4',
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#e9f2ff'
  }
}))

function Boards() {
  const [boards, setBoards] = useState(null)
  const [totalBoards, setTotalBoards] = useState(null)
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const page = parseInt(query.get('page') || '1', 10)

  const updateStateData = (res) => {
    setBoards(res.boards || [])
    setTotalBoards(res.totalBoards || 0)
  }

  useEffect(() => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }, [location.search])

  const onCreatedBoard = () => {
    fetchBoardsAPI(location.search).then(updateStateData)
  }

  if (!boards) {
    return <PageLoadingSpinner caption="Loading Boards..." />
  }

  return (
    <Container disableGutters maxWidth={false}>
      <AppBar />
      <Box sx={{ paddingX: 2, my: 4 }}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={3}>
            <Stack direction="column" spacing={1}>
              <SidebarItem className="active">
                <SpaceDashboardIcon fontSize="small" />
                Boards
              </SidebarItem>
              <SidebarItem>
                <ListAltIcon fontSize="small" />
                Templates
              </SidebarItem>
              <SidebarItem>
                <HomeIcon fontSize="small" />
                Home
              </SidebarItem>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack direction="column" spacing={1}>
              <SidebarCreateBoardModal onCreatedBoard={onCreatedBoard} />
            </Stack>
          </Grid>

          <Grid xs={12} sm={9}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Your boards:</Typography>
            {boards?.length === 0 &&
              <Typography variant="span" sx={{ fontWeight: 'bold', mb: 3 }}>No result found!</Typography>
            }

            {boards?.length > 0 &&
              <Grid container spacing={2}>
                {boards.map(b =>
                  <Grid xs={2} sm={3} md={4} key={b._id}>
                    <Card sx={{ width: '250px' }}>
                      <Box sx={{ height: '50px', backgroundColor: randomColor() }}></Box>

                      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {b.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {b.description}
                        </Typography>
                        <Box
                          component={Link}
                          to={`/boards/${b._id}`}
                          sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            color: 'primary.main',
                            '&:hover': { color: 'primary.light' }
                          }}>
                          Go to board <ArrowRightIcon fontSize="small" />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            }

            {(totalBoards > 0) &&
              <Box sx={{ my: 3, pr: 5, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Pagination
                  size="large"
                  color="secondary"
                  showFirstButton
                  showLastButton
                  count={Math.ceil(totalBoards / DEFAULT_ITEMS_PER_PAGE)}
                  page={page}
                  renderItem={(item) => (
                    <PaginationItem
                      component={Link}
                      to={`/boards${item.page === DEFAULT_PAGE ? '' : `?page=${item.page}`}`}
                      {...item}
                    />
                  )}
                />
              </Box>
            }
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default Boards
