
import bpy

OUTPUT_PATH = '/tmp/bc7d1e20-247c-42d9-8b35-f267bfaabbce.glb'

def create_wall_skeleton():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    ft_to_m = 0.3048

    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.15

    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_width / 2, wall_thickness / 2, wall_height / 2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    cutout_width = 7.0 * ft_to_m
    cutout_height = 8.0 * ft_to_m
    cutout_thickness = 0.5

    bpy.ops.mesh.primitive_cube_add(size=1, location=(cutout_width / 2, wall_thickness / 2, cutout_height / 2))
    cutout = bpy.context.active_object
    cutout.name = "Cutout_Volume"
    cutout.scale = (cutout_width, cutout_thickness, cutout_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    bool_mod = wall.modifiers.new(name="WallCutout", type='BOOLEAN')
    bool_mod.object = cutout
    bool_mod.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier="WallCutout")
    bpy.data.objects.remove(cutout, do_unlink=True)

    bpy.ops.export_scene.gltf(filepath=OUTPUT_PATH, export_format='GLB', use_selection=False)

create_wall_skeleton()
