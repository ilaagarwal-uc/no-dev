OUTPUT_PATH = '/tmp/86f0e658-2479-4bad-ab09-72df80de669d.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Dimensions in feet (1 unit = 1 foot)
    wall_width = 14.5  # 7' + 7'6"
    wall_height = 9.0
    wall_thickness = 0.5
    
    opening_width = 7.0
    opening_height = 8.0
    
    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    # Position so bottom-left-front is at (0,0,0)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Opening (Door/Window area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening_Cutter"
    opening.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position opening at the left side, starting from floor
    opening.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Subtract Opening from Wall using Boolean Modifier
    bool_mod = wall.modifiers.new(name="Opening_Cut", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutter object
    bpy.data.objects.remove(opening, do_unlink=True)

    # Export to GLB
    # Headless blender usually requires a full path, but 'wall_skeleton.glb' works for local execution
    bpy.ops.export_scene.gltf(filepath='/tmp/86f0e658-2479-4bad-ab09-72df80de669d.glb', export_format='GLB', use_selection=False)

create_wall_skeleton()