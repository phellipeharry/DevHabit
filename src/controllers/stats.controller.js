import { getChartData } from '../services/stats.service.js'
import { successResponse } from '../utils/response.js'

export const getChart = async (req, res, next) => {
  try {
    const { id } = req.user

    const chart = await getChartData(id)

    return successResponse(
      res,
      'Dados do gráfico obtidos com sucesso',
      chart
    )
  } catch (err) {
    return next(err)
  }
}