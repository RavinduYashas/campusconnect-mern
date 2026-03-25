import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const SportsTeamForm = ({ team = null, onSaved, onCancel }) => {
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .matches(/^[A-Za-z\s]+$/, 'Name may only contain letters and spaces'),
        coach: Yup.string()
            .required('Coach is required')
            .matches(/^[A-Za-z\s]+$/, 'Coach may only contain letters and spaces'),
        maxMembers: Yup.number().nullable().transform((v, o) => (o === '' ? null : v)).min(1, 'Max members must be at least 1')
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: team?.name || '',
            description: team?.description || '',
            coach: team?.coach || '',
            maxMembers: team?.maxMembers || ''
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const payload = { name: values.name, description: values.description, coach: values.coach };
                if (values.maxMembers !== null && values.maxMembers !== '') payload.maxMembers = Number(values.maxMembers);
                let res;
                if (team && (team._id || team.id)) {
                    const id = team._id || team.id;
                    res = await fetch(`/api/sports/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                } else {
                    res = await fetch(`/api/sports`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                }
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Save failed');
                onSaved && onSaved(body);
            } catch (err) {
                alert(err.message || 'Save failed');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{team ? 'Edit Team' : 'Create Team'}</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} className="mt-1 block w-full border rounded-md p-2" />
                    {formik.touched.name && formik.errors.name && <div className="text-xs text-red-600 mt-1">{formik.errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Max Members</label>
                    <input name="maxMembers" value={formik.values.maxMembers} onChange={formik.handleChange} onBlur={formik.handleBlur} type="number" min={1} className="mt-1 block w-full border rounded-md p-2" placeholder="Leave empty for unlimited" />
                    {formik.touched.maxMembers && formik.errors.maxMembers && <div className="text-xs text-red-600 mt-1">{formik.errors.maxMembers}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Coach</label>
                    <input name="coach" value={formik.values.coach} onChange={formik.handleChange} onBlur={formik.handleBlur} className="mt-1 block w-full border rounded-md p-2" />
                    {formik.touched.coach && formik.errors.coach && <div className="text-xs text-red-600 mt-1">{formik.errors.coach}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} className="mt-1 block w-full border rounded-md p-2" rows={4} />
                </div>

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};

export default SportsTeamForm;
