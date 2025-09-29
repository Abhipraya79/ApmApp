import apiClient from "./apiClient";

export interface NewPxPayload {
  id?: string;            
  namaPx: string;
  addrPx: string;
  kelurahanPx?: string;
  teleponPx?: string;
  tlahirPx?: string;       
  jkPx?: string;         
  noKtp?: string;
  domisiliPx?: string;
  noJkn?: string;
}

export const newPx = async (payload: NewPxPayload) => {
  const body: any = {
    regNum: payload.id ?? null,                   
    nama: payload.namaPx?.trim(),
    addr: payload.addrPx?.trim() ?? null,
    kelurahan: payload.kelurahanPx?.trim() ?? null,
    telepon: payload.teleponPx?.trim() ?? null,
    tanggalLahir: payload.tlahirPx ? payload.tlahirPx : null,
    jenisKelamin: payload.jkPx ?? null,
    noKtp: payload.noKtp?.trim() ?? null,
    domisili: payload.domisiliPx?.trim() ?? null,
    nokaBpjs: payload.noJkn?.trim() ?? null
  };

  const res = await apiClient.post("/api/profilepx", body);
  return res.data;
};
