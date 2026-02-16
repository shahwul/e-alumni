export function buildDiklatQuery(searchParams) {
  // 1. Pagination
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  // 2. Filter Params
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  
  // Dropdown Filters
  const rumpunId = searchParams.get('rumpun');
  const subRumpunId = searchParams.get('sub_rumpun');

  // Array Filters
  const modaArray = searchParams.get('moda')?.split(',') || [];
  const kategoriArray = searchParams.get('kategori')?.split(',') || [];
  const programArray = searchParams.get('program')?.split(',') || [];
  const jenjangArray = searchParams.get('jenjang')?.split(',') || [];
  const jabatanArray = searchParams.get('jabatan')?.split(',') || [];

  const where = { AND: [] };

  const sortParam = searchParams.get('sort'); 

  let orderBy = [];

  if (sortParam) {
    const sortPairs = sortParam.split(','); 
    
    sortPairs.forEach(pair => {
      const [field, direction] = pair.split(':');
      const dir = direction === 'desc' ? 'desc' : 'asc';
      const validFields = ['title', 'start_date', 'total_jp', 'total_peserta', 'moda'];

      if (validFields.includes(field)) {
        if (field === 'moda') {
          orderBy.push({ ref_mode: { mode_name: dir } });
        } 
        else if (field === 'total_peserta') {
          orderBy.push({ data_alumni: { _count: dir } });
        } 
        else {
          orderBy.push({ [field]: dir });
        }
      }
    });
  }

  if (orderBy.length === 0) {
    orderBy = [{ start_date: 'desc' }];
  }

  if (search) {
    where.AND.push({
      title: { contains: search, mode: 'insensitive' }
    });
  }

  if (startDate) {
    where.AND.push({ start_date: { gte: new Date(startDate) } });
  }
  if (endDate) {
    where.AND.push({ end_date: { lte: new Date(endDate) } });
  }

  if (rumpunId && rumpunId !== 'ALL') {
    where.AND.push({ topic_id: parseInt(rumpunId) });
  }
  if (subRumpunId && subRumpunId !== 'ALL') {
    where.AND.push({ sub_topic_id: parseInt(subRumpunId) });
  }

  if (modaArray.length > 0) {
    where.AND.push({
      ref_mode: { mode_name: { in: modaArray, mode: 'insensitive' } }
    });
  }
  if (kategoriArray.length > 0) {
     where.AND.push({ jenis_kegiatan: { in: kategoriArray } }); 
  }
  if (programArray.length > 0) {
     where.AND.push({ jenis_program: { in: programArray } });
  }

  if (jenjangArray.length > 0) {
    where.AND.push({
      OR: jenjangArray.map(j => ({
         ref_jenjang_sasaran: { level_name: { contains: j, mode: 'insensitive' } }
      }))
    });
  }
  if (jabatanArray.length > 0) {
    where.AND.push({
      OR: jabatanArray.map(j => ({
         ref_jabatan_sasaran: { occupation_name: { contains: j, mode: 'insensitive' } }
      }))
    });
  }

  return {
    where,
    page,
    limit,
    skip,
    orderBy
  };
}