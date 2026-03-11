OUTPUT_PATH = '/tmp/80428282-63c0-413b-960d-a2760b4c182b.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    ft_to_m = 0.3048

    # Dimensions from the image analysis
    # Total Width = 7' (left section) + 7'6" (right section) = 14.5 feet
    wall_width = 14.5 * ft_to_m
    # Total Height = 8' (door height) + 1' (top gap) = 9 feet
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.1  # Standard wall thickness (approx 4 inches)

    # Opening dimensions (Door + AC area)
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m
    opening_thickness = 0.5  # Thicker than wall for clean boolean cut

    # 1. Create the Main Wall
    # Positioned so the bottom-left corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_width / 2, 0, wall_height / 2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 2. Create the Opening (Cutter)
    # Positioned at the bottom-left of the wall
    bpy.ops.mesh.primitive_cube_add(size=1, location=(opening_width / 2, 0, opening_height / 2))
    opening_cutter = bpy.context.active_object
    opening_cutter.name = "OpeningCutter"
    opening_cutter.scale = (opening_width, opening_thickness, opening_height)
    bpy.ops.object.transform_apply(scale=True, location=False, rotation=False)

    # 3. Subtract the opening from the wall using Boolean modifier
    bool_mod = wall.modifiers.new(name="WallOpening", type='BOOLEAN')
    bool_mod.object = opening_cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Remove the cutter object
    bpy.data.objects.remove(opening_cutter, do_unlink=True)

    # 5. Export to GLB
    # Exporting all objects in the scene to a single GLB file
    bpy.ops.export_scene.gltf(
        filepath='/tmp/80428282-63c0-413b-960d-a2760b4c182b.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the function directly
create_wall_skeleton()